import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BlogListComponent } from './components/blog-list/blog-list.component';
import { CreateBlogComponent } from './components/create-blog/create-blog.component';
import { UpdateBlogComponent } from './components/update-blog/update-blog.component';
import { DeleteBlogComponent } from './components/delete-blog/delete-blog.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthService } from './services/auth.service';
import { BlogService } from './services/blog.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SignupComponent,
    LoginComponent,
    NavbarComponent,
    BlogListComponent,
    CreateBlogComponent,
    UpdateBlogComponent,
    DeleteBlogComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    MatSnackBarModule,
    BrowserAnimationsModule
  ],
  providers: [AuthService, BlogService],
  bootstrap: [AppComponent]
})
export class AppModule { }
