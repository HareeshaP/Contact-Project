import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Contact } from '../models/conatcts.model';
import { Observable } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe, FormsModule, ReactiveFormsModule, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  http = inject(HttpClient);

  isSubmitting = false;
  errorMessage = '';

  contactsForm = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    email: new FormControl<string | null>(null, [Validators.email]),
    phone: new FormControl<string>('',{
      nonNullable: true,
      validators: [Validators.required]
    }),
    favorite: new FormControl<boolean>(false),
  })

  contacts$ = this.getConatcts();
  
  onFormSubmit() {
    if(this.contactsForm.invalid){
      this.contactsForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage='';

    const addContactRequest = {
      name: this.contactsForm.value.name,
      email: this.contactsForm.value.email,
      phone: this.contactsForm.value.phone,
      favorite: this.contactsForm.value.favorite
    }

    this.http.post('https://localhost:7079/api/Contacts', addContactRequest)
    .subscribe({
      next: (value) => {
        console.log(value);
        this.contacts$ = this.getConatcts();
        this.contactsForm.reset({ favorite: false});
        this.isSubmitting = false;
      },

      error: () => {
        this.errorMessage = 'Failed to add contact. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onDelete(id: string){
    this.http.delete(`https://localhost:7079/api/Contacts/${id}`)
    .subscribe({
      next: (value) => {
        alert('Item deleted');
        this.contacts$ = this.getConatcts();
      }
    })
  }

  private getConatcts(): Observable<Contact[]>{
    return this.http.get<Contact[]>('https://localhost:7079/api/Contacts');

  }
}