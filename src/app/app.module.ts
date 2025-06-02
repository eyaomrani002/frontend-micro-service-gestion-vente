import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Angular2SmartTableModule } from 'angular2-smart-table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from './shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgChartsModule } from 'ng2-charts';
import { AuthInterceptor } from './interceptors/auth.interceptor';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ToastrModule.forRoot(),
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule, // Correctly imported
    Angular2SmartTableModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    SharedModule,
    NgbPaginationModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    NgChartsModule
  ],
    providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: []
})
export class AppModule { }