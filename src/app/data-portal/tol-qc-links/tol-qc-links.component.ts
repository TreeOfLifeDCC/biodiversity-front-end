import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatList} from "@angular/material/list";

@Component({
  selector: 'app-tol-qc-links',
  templateUrl: './tol-qc-links.component.html',
  styleUrls: ['./tol-qc-links.component.scss'],
  imports: [
    MatList
  ],
  standalone: true
})
export class TolQcLinksComponent implements OnDestroy {

  constructor(
      public dialogReg: MatDialogRef<TolQcLinksComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  close(): void {
    this.dialogReg.close();
  }

  ngOnDestroy(): void {
    this.dialogReg.close();
  }

}
