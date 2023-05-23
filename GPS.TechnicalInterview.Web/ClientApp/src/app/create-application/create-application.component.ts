import { AfterViewInit } from '@angular/core';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, UrlSegment } from '@angular/router'
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FormMode } from '../shared/models/form.model';
import { ApplicationFormService } from '../shared/services/applicationForm.service';
import { LoadApplication } from '../store/actions/application.actions';
import { applicationRecord } from '../store/selectors/application.selector';

@Component({
  selector: 'app-create-application',
  templateUrl: './create-application.component.html',
  styleUrls: ['./create-application.component.scss']
})
export class CreateApplicationComponent implements AfterViewInit {

    public mode$: Observable<FormMode>

    public applicationForm: FormGroup;
    public statuses: Array<string> = ['New', 'Approved', 'Funded'];
    public id: string = null

    constructor(
        private formBuilder: FormBuilder,
        public store: Store<any>,
        public route: ActivatedRoute,
        public applicationFormService: ApplicationFormService
    ) {
        this.mode$ = route.url.pipe(map((url: UrlSegment[]) => {
            let mode: FormMode = url[0].path.split('-')[0] as FormMode;
            if (mode == 'edit') {
                this.id = url[url.length - 1].path;
            }
            return mode
        }));

        this.applicationForm = this.formBuilder.group({
            firstName: [null],
            lastName: [null],
            phoneNumber: [null],
            email: [null],
            applicationNumber: [null],
            status: ['New'],
            amount: [null],
            monthlyPayAmount: [null],
            terms: [null],
        });
    }

    public ngAfterViewInit(): void {
        if (this.store.select(applicationsList => applicationsList.length < 1)) {
            this.store.dispatch(new LoadApplication(this.id))
        }

        if (this.id) this.store.select(applicationRecord(this.id)).subscribe(data => {
            
            let formattedData = data ? this.applicationFormService.dataToForm(data) : {};
            console.log(formattedData);
            this.applicationForm.patchValue({
                ...formattedData
            })
        });
    }

}
