import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { CreateBlogComponent } from './components/create-blog/create-blog.component';
import { BlogListComponent } from './components/blog-list/blog-list.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { UpdateBlogComponent } from './components/update-blog/update-blog.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'create-blog', component: CreateBlogComponent },
  { path: 'post/:id', component: PostDetailComponent },
  { path: 'blogs', component: BlogListComponent },
  { path: 'update-blog/:id', component: UpdateBlogComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
