import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

// Import Containers
import { DefaultLayoutComponent } from "./containers";

import { P404Component } from "./views/error/404.component";
import { P500Component } from "./views/error/500.component";
import { LoginComponent } from "./views/login/login.component";
import { RegisterComponent } from "./views/register/register.component";
import { UserAuth } from "./commenHelper/userAuth";
import { SetNewPasswordComponent } from "./views/setNewPassword/setNewPassword.component";
import { NgxPermissionsGuard } from "ngx-permissions";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full"
  },
  {
    path: "404",
    component: P404Component,
    data: {
      title: "Page 404"
    }
  },
  {
    path: "500",
    component: P500Component,
    data: {
      title: "Page 500"
    }
  },
  {
    path: "login",
    component: LoginComponent,
    data: {
      title: "Login Page"
    }
  },
  {
    path: "setPassword/:setPasstoken",
    component: SetNewPasswordComponent,
    data: {
      title: "Set New Doctor Password"
    }
  },
  {
    path: "register",
    component: RegisterComponent,
    data: {
      title: "Register Page"
    }
  },
  {
    path: "",
    component: DefaultLayoutComponent,
    canActivate: [UserAuth],
    data: {
      title: "Home"
    },
    children: [
      {
        path: "changePassword",
        loadChildren:
          "./views/changePassword/changePassword.module#ChangePasswordModule"
      },
      {
        path: "mealPlanManagement/:userId/:userName",
        loadChildren:
          "./views/mealPlanManagement/mealPlanManagement.module#MealPlanManagementModule"
      },
      {
        path: "notesManagement/:userId",
        loadChildren:
          "./views/notesManagement/notesManagement.module#NotesManagementManagementModule"
      },
      {
        path: "changedSlots",
        loadChildren:
          "./views/changedSlots/changedSlots.module#ChangedSlotsModule"
      },
      {
        path: "addHoliday",
        loadChildren: "./views/addHoliday/addHoliday.module#AddHolidayModule"
      },
      {
        path: "userProfile",
        loadChildren:
          "./views/adminProfile/adminProfile.module#AdminProfileModule"
      },
      {
        path: "userManagement",
        data: {
          permissions: {
            only: "userManagement",
            redirectTo: "login"
          }
        },
        canActivate: [UserAuth, NgxPermissionsGuard],
        loadChildren:
          "./views/userManagement/userManagement.module#UserManagementModule"
      },
      {
        path: "doctorManagement",
        data: {
          permissions: {
            only: "doctorManagement",
            redirectTo: "login"
          }
        },
        canActivate: [NgxPermissionsGuard],
        loadChildren:
          "./views/doctorManagement/doctorManagement.module#DoctorManagementModule"
      },
      {
        path: "nutritionManagement",
        data: {
          permissions: {
            only: "nutritionManagement",
            redirectTo: "login"
          }
        },
        canActivate: [NgxPermissionsGuard],
        loadChildren:
          "./views/nutritionManagement/nutritionManagement.module#NutritionManagementModule"
      },
      {
        path: "chefManagement",
        data: {
          permissions: {
            only: "chefManagement",
            redirectTo: "login"
          }
        },
        canActivate: [NgxPermissionsGuard],
        loadChildren:
          "./views/chefManagement/chefManagement.module#ChefManagementModule"
      },
      {
        path: "labAssistantManagement",
        data: {
          permissions: {
            only: "labAssistantManagement",
            redirectTo: "login"
          }
        },
        canActivate: [NgxPermissionsGuard],
        loadChildren:
          "./views/labAssistantManagement/labAssistantManagement.module#LabAssistantManagementModule"
      },
      {
        path: "blogManagement",
        data: {
          permissions: {
            only: "blogManagement",
            redirectTo: "login"
          }
        },
        canActivate: [NgxPermissionsGuard],
        loadChildren:
          "./views/blogManagement/blogManagement.module#BlogManagementModule"
      },
      {
        path: "recipeManagement",
        data: {
          permissions: {
            only: "recipeManagement",
            redirectTo: "login"
          }
        },
        canActivate: [NgxPermissionsGuard],
        loadChildren:
          "./views/recipeManagement/recipeManagement.module#RecipeManagementModule"
      },
      {
        path: "reportManagement",
        data: {
          permissions: {
            only: "reportManagement",
            redirectTo: "login"
          }
        },
        canActivate: [NgxPermissionsGuard],
        loadChildren:
          "./views/reportManagement/reportManagement.module#ReportManagementModule"
      },
      {
        path: "categoryManagement",
        data: {
          permissions: {
            only: "categoryManagement",
            redirectTo: "login"
          }
        },
        canActivate: [NgxPermissionsGuard],
        loadChildren:
          "./views/categoryManagement/categoryManagement.module#CategoryManagementModule"
      },
      {
        path: "adminManagement",
        data: {
          permissions: {
            only: "adminManagement",
            redirectTo: "login"
          }
        },
        canActivate: [NgxPermissionsGuard],
        loadChildren:
          "./views/adminManagement/adminManagement.module#AdminManagementModule"
      },
      {
        path: "feedbackManagement",
        data: {
          permissions: {
            only: "feedbackManagement",
            redirectTo: "login"
          }
        },
        canActivate: [NgxPermissionsGuard],
        loadChildren:
          "./views/feedbackManagement/feedbackManagement.module#FeedbackManagementModule"
      },
      {
        path: "exerciseManagement",
        data: {
          permissions: {
            only: "exerciseManagement",
            redirectTo: "login"
          }
        },
        canActivate: [NgxPermissionsGuard],
        loadChildren:
          "./views/exerciseManagement/exerciseManagement.module#ExerciseManagementModule"
      },
      {
        path: "tipManagement",
        data: {
          permissions: {
            only: "tipManagement",
            redirectTo: "login"
          }
        },
        canActivate: [NgxPermissionsGuard],
        loadChildren:
          "./views/tipManagement/tipManagement.module#TipManagementModule"
      },
      {
        path: "chatManagement",
        data: {
          permissions: {
            only: "chatManagement",
            redirectTo: "login"
          }
        },
        canActivate: [NgxPermissionsGuard],
        loadChildren:
          "./views/chatManagement/chatManagement.module#ChatManagementModule"
      },
      {
        path: "contentManagement",
        data: {
          permissions: {
            only: "contentManagement",
            redirectTo: "login"
          }
        },
        canActivate: [NgxPermissionsGuard],
        loadChildren:
          "./views/contentManagement/contentManagement.module#ContentManagementModule"
      },
      {
        path: "cookingVideoManagement",
        data: {
          permissions: {
            only: "cookingVideoManagement",
            redirectTo: "login"
          }
        },
        canActivate: [NgxPermissionsGuard],
        loadChildren:
          "./views/cookingVideoManagement/cookingVideoManagement.module#CookingVideoManagementModule"
      }
    ]
  },
  { path: "**", component: P404Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
