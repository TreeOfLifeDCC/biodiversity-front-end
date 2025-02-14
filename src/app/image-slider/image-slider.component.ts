import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-image-slider',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './image-slider.component.html',
  styleUrl: './image-slider.component.scss',
})
export class ImageSliderComponent implements OnInit, OnChanges {
  @Input() slides: any[] = [];
  @Input() indicatorsVisible = true;
  @Input() animationSpeed = 500;
  @Input() autoPlay = false;
  @Input() autoPlaySpeed = 3000;
  currentSlide = 0;
  faArrowRight = faArrowRight;
  faArrowLeft = faArrowLeft;
  hidden = false;
  displayArrows = false;

  ngOnInit() {
    if (this.autoPlay) {
      setInterval(() => {
        this.next();
      }, this.autoPlaySpeed);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['slides'] && this.slides.length > 1) {
      this.displayArrows = true;
    } else {
      this.displayArrows = false;
    }
  }

  next() {
    if (this.slides.length > 0) {
      this.jumpToSlide((this.currentSlide + 1) % this.slides.length);
    }
  }

  previous() {
    if (this.slides.length > 0) {
      this.jumpToSlide((this.currentSlide - 1 + this.slides.length) % this.slides.length);
    }
  }

  jumpToSlide(index: number) {
    this.hidden = true;
    setTimeout(() => {
      this.currentSlide = index;
      this.hidden = false;
    }, this.animationSpeed);
  }

  getImageUrl() {
    return this.slides.length > 0 ? this.slides[this.currentSlide].url : '';
  }
}
