import { Routes } from "@angular/router";

export const routes: Routes = [
    { path: "", pathMatch: "full", redirectTo: "/events" },
    { path: "events", pathMatch: "full", redirectTo: "/events/upcoming/1" },
    {
        path: "events/:state/:page",
        loadComponent: async () => {
            return import("./pages/events/events.component").then((c) => {
                return c.EventsComponent;
            });
        },
    },
    {
        path: "organizers",
        loadComponent: async () => {
            return import("./pages/organizers/organizers.component").then(
                (c) => {
                    return c.OrganizersComponent;
                }
            );
        },
    },
    {
        path: "organizers/:organizerId/:state/:page",
        loadComponent: async () => {
            return import("./pages/organizer/organizer.component").then((c) => {
                return c.OrganizerComponent;
            });
        },
    },
    {
        path: "welcome",
        loadChildren: () =>
            import("./pages/welcome/welcome.routes").then(
                (m) => m.WELCOME_ROUTES
            ),
    },
];
