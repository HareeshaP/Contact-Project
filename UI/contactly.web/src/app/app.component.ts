import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, ɵEmptyOutletComponent } from '@angular/router';
import { Contact } from '../models/conatcts.model';
import { concatAll, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AsyncPipe, NgIf, NgClass, NgForOf } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe, FormsModule, ReactiveFormsModule, NgIf, NgForOf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{

  searchControl = new FormControl('');

  ngOnInit(): void {
    this.loadContacts();

    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(value => {
        this.loadContacts(value || '');
      });
  }

  editingContactId: string | null = null;
  deletingId: string | null = null;
  http = inject(HttpClient);

  contacts$!: Observable<Contact[]>;
  isLoading = false;
  isSubmitting = false;
  formErrorMessage = '';
  loadErrorMessage = '';

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

  //contacts$ = this.getConatcts();
  
  loadContacts(search: string='') {
    this.isLoading=true;
    this.loadErrorMessage = '';

    const url = search
    ? `https://localhost:7079/api/Contacts?search=${encodeURIComponent(search)}`
    : `https://localhost:7079/api/Contacts`;

    this.contacts$ = this.http
      .get<Contact[]>(url);

    this.contacts$.subscribe({
      next: () => this.isLoading = false,
      error: () => {
        this.loadErrorMessage = 'Failed to load contacts';
        this.isLoading = false;
      }
    });
  }

  onFormSubmit() {
    if(this.contactsForm.invalid){
      this.contactsForm.markAllAsTouched();
      return;
    }

    const contactData = this.contactsForm.value;

    this.isSubmitting = true;
    this.formErrorMessage='';

    const addContactRequest = {
      name: this.contactsForm.value.name,
      email: this.contactsForm.value.email,
      phone: this.contactsForm.value.phone,
      favorite: this.contactsForm.value.favorite
    }

    if(this.editingContactId){
      //EDIT
      this.http.put(`https://localhost:7079/api/Contacts/${this.editingContactId}`,
        contactData
      ).subscribe({
        next: () => {
          this.resetForm();
          this.loadContacts();
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      // CREATE
      this.http.post('https://localhost:7079/api/Contacts',
        contactData
      ).subscribe({
        next: () => {
          this.resetForm();
          this.loadContacts();
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    }
    /*this.http.post('https://localhost:7079/api/Contacts', addContactRequest)
    .subscribe({
      next: (value) => {
        console.log(value);
        this.loadContacts();
        this.contacts$ = this.getConatcts();
        this.contactsForm.reset({ favorite: false});
        this.isSubmitting = false;
      },

      error: () => {
        this.formErrorMessage = 'Failed to add contact. Please try again.';
        this.isSubmitting = false;
      }
    });*/
  }

  resetForm() {
    this.contactsForm.reset({ favorite: false});
    this.editingContactId = null;
    this.isSubmitting = false;
  }

  onDelete(id: string){
    const confirmDelete = confirm('Are you sure you want to delete this contact?');
    
    if(!confirmDelete) return;

    this.deletingId = id;

    this.http.delete(`https://localhost:7079/api/Contacts/${id}`)
    .subscribe({
      next: (value) => {
        this.deletingId = null;
        this.loadContacts(); //refresh list
      },
      error: () => {
        this.deletingId = null;
        alert('Failed to delete contact');
      }
    });
  }

  private getConatcts(): Observable<Contact[]>{
    return this.http.get<Contact[]>('https://localhost:7079/api/Contacts');

  }

  onEdit(contact: Contact){
    this.editingContactId = contact.id;

    this.contactsForm.patchValue({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      favorite: false
    });
  }
}