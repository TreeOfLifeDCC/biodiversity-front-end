
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output } from '@angular/core';

import { PageEvent as PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { NgFor, DecimalPipe } from '@angular/common';


@Component({
    selector: 'app-paginator',
    templateUrl: './paginator.component.html',
    styleUrls: ['./paginator.component.scss'],
    standalone: true,
    imports: [FormsModule, NgFor, DecimalPipe]
})
export class PaginatorComponent implements OnInit {

  @Input()
      // @ts-ignore
  pageIndex: number;

  @Input()
      // @ts-ignore
  pageSizeOptions: number[] = [10,20,50,100];

  @Input()
      // @ts-ignore
  pageSize: number;

  @Input()
      // @ts-ignore
  length: number;

  @Output()
  readonly page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  constructor() {

  }

  ngOnInit(): void {
  }

  /**
   * whether to show previous/first buttons
   */
  public get previous(): boolean {
    return this.pageIndex > 0;
  }

  /**
   * whether to show next/last buttons
   */
  public get next(): boolean {
    return this.pageIndex < this.totalPages - 1;
  }

  get totalPages(): number {
    return Math.floor(this.length / this.pageSize) + (this.length % this.pageSize > 0 ? 1 : 0);
  }

  public nextPage(): void {
    if (!this.next) { return; }

    const previousPageIndex = this.pageIndex;
    this.pageIndex++;
    this.emitPageEvent(previousPageIndex);
  }

  public previousPage(): void {
    if (!this.previous) { return; }

    const previousPageIndex = this.pageIndex;
    this.pageIndex--;
    this.emitPageEvent(previousPageIndex);
  }

  public changeSize(pageSize: any) {
    const startIndex = this.pageIndex * this.pageSize;
    const previousPageIndex = this.pageIndex;

    this.pageIndex = Math.floor(startIndex / pageSize.currentTarget.value);
    this.pageSize = +pageSize.currentTarget.value;

    this.emitPageEvent(previousPageIndex);
  }

  public changePageIndex(pageIndex: any) {
    const previousPageIndex = this.pageIndex;

    if (pageIndex.currentTarget.value < 1) {
      this.pageIndex = 0;
    } else if (pageIndex.currentTarget.value < this.totalPages) {
      this.pageIndex = pageIndex.currentTarget.value - 1;
    } else {
      this.pageIndex = this.totalPages - 1;
    }

    this.emitPageEvent(previousPageIndex);
  }

  private emitPageEvent(previousPageIndex: number) {
    this.page.emit({
      previousPageIndex,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      length: this.length
    });
  }
}
