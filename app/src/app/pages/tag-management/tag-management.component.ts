import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service"; // Import AuthService
import { TagService } from "../../services/tag.service";
import { ITag } from "../../types";

@Component({
    selector: "app-tag-management",
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: "./tag-management.component.html",
    styleUrl: "./tag-management.component.less",
})
export class TagManagementComponent implements OnInit {
    private tagService = inject(TagService);
    private authService = inject(AuthService); // Inject AuthService
    tags: ITag[] = [];
    selectedTag: ITag | null = null;
    isEditModalOpen: boolean = false;
    editingTagId: string | null = null;
    editedTagName: string = "";
    originalTagName: string = ""; // Added for cancel functionality
    saveSuccessTagId: string | null = null;
    isAdmin: boolean = false;
    appliedPreviewColorClass: { colorClass: string; tagId: string } | null =
        null;

    colorClasses = [
        "primary",
        "secondary",
        "neutral",
        "accent",
        "info",
        "success",
        "warning",
        "error",
    ];

    constructor() {
        this.authService.authState$.subscribe((user) => {
            this.isAdmin = this.authService.isAdmin();
        });
    }

    ngOnInit(): void {
        this.loadTags();
    }

    loadTags(): void {
        this.tagService.getAllTags().subscribe((tags) => {
            this.tags = tags;
        });
    }

    openEditModal(tag: ITag): void {
        this.selectedTag = { ...tag }; // Create a copy to avoid direct mutation
        this.isEditModalOpen = true;
    }

    closeEditModal(): void {
        this.isEditModalOpen = false;
        this.selectedTag = null;
    }

    async saveTag(): Promise<void> {
        if (this.selectedTag) {
            await this.tagService.updateTag(this.selectedTag);
            this.loadTags(); // Reload tags after update
            this.closeEditModal();
            this.showSaveSuccessFeedback(this.selectedTag.id);
        }
    }

    startEdit(tag: ITag): void {
        console.log("Starting edit for tag:", tag);
        console.log("Is admin:", this.isAdmin);
        if (this.isAdmin) {
            this.editingTagId = tag.id;
            this.editedTagName = tag.name;
            this.originalTagName = tag.name; // Store original name
        }
    }

    async saveNameEdit(tag: ITag): Promise<void> {
        if (this.editedTagName.trim() && this.editedTagName !== tag.name) {
            const updatedTag: ITag = {
                ...tag,
                name: this.editedTagName.trim(),
                details: tag.details, // Ensure details are carried over
            };
            await this.tagService.updateTag(updatedTag);
            this.loadTags();
            this.showSaveSuccessFeedback(tag.id);
        }
        this.editingTagId = null;
        this.editedTagName = "";
    }

    async addNewTag(): Promise<void> {
        const newTag: Omit<ITag, "id"> = {
            name: "New Tag",
            colorClass: "default",
            details: "Enter details here",
        };
        await this.tagService.addTag(newTag);
        this.loadTags();
    }

    cancelEdit(tag: ITag): void {
        // Revert to original name if editing this tag
        if (this.editingTagId === tag.id) {
            const tagToRevert = this.tags.find((t) => t.id === tag.id);
            if (tagToRevert) {
                tagToRevert.name = this.originalTagName;
            }
        }
        this.editingTagId = null;
        this.editedTagName = "";
        this.originalTagName = ""; // Clear original name
    }

    showSaveSuccessFeedback(tagId: string): void {
        this.saveSuccessTagId = tagId;
        setTimeout(() => {
            this.saveSuccessTagId = null;
        }, 10000); // 10 seconds
    }
    applyTemporaryColorClass(
        colorClass: string,
        event: Event,
        tagId?: string
    ): void {
        event.stopPropagation();
        this.appliedPreviewColorClass = {
            colorClass: colorClass,
            tagId: tagId || "",
        };
    }

    clearTemporaryColorClass(): void {
        this.appliedPreviewColorClass = null;
    }
}
