import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Contact } from '../models/conatcts.model';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  http = inject(HttpClient);

  contactsForm = new FormGroup({
    name: new FormControl<string>(''),
    email: new FormControl<string | null>(null),
    phone: new FormControl<string>(''),
    favorite: new FormControl<boolean>(false)
  })

  contacts$ = this.getConatcts();
  
  onFormSubmit() {
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
        this.contactsForm.reset();
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