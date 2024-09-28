import { Routes } from "@angular/router";

export const routes: Routes = [
    { path: "", pathMatch: "full", redirectTo: "/events" },
    {
        path: "events",
        loadComponent: async () => {
            return import("./pages/events/events.component").then((c) => {
                return c.EventsComponent;
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
