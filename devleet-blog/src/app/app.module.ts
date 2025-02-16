import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

import { CreateBlogComponent } from './components/create-blog/create-blog.component';
import { UpdateBlogComponent } from './components/update-blog/update-blog.component';
import { BlogListComponent } from './components/blog-list/blog-list.component';
import { DeleteBlogComponent } from './components/delete-blog/delete-blog.component';

@NgModule({
  declarations: [
    AppComponent,
    CreateBlogComponent,
    UpdateBlogComponent,
    BlogListComponent,
    DeleteBlogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule  // ✅ This fixes the "ngModel" error
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
