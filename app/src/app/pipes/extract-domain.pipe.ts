import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "extractDomain",
    standalone: true,
})
export class ExtractDomainPipe implements PipeTransform {
    transform(value: string, ...args: unknown[]): string {
        return (value.match(
            /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im
        ) ?? ["", ""])[1];
    }
}
