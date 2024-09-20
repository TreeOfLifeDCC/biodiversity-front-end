import { Component } from '@angular/core';
import {MatCard, MatCardActions, MatCardContent, MatCardTitle} from "@angular/material/card";

@Component({
  selector: 'app-bulk-downloads',
  standalone: true,
    imports: [
        MatCard,
        MatCardTitle,
        MatCardActions,
        MatCardContent
    ],
  templateUrl: './bulk-downloads.component.html',
  styleUrl: './bulk-downloads.component.scss'
})
export class BulkDownloadsComponent {

}
