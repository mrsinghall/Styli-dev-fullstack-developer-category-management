import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppService } from './app.service';
import { CommonModule } from '@angular/common';

interface Category {
  _id: number;
  name: string;
  subcategories: SubCategory[];
}

interface SubCategory {
  _id: number;
  name: string;
  filters: any[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatSelectModule, FormsModule, HttpClientModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ecommerce-dahboard';
  selectedCountry: string = 'saudi_arabia';
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  filters: any[] = [];
  selectedCategoryId: number | null = null;
  selectedSubCategoryId: number | null = null;

  constructor(private appService: AppService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.appService.getCategories().subscribe((response: any) => {
      this.categories = response.data;
      this.setInitialCategoryAndSubCategory();
    });
  }

  private setInitialCategoryAndSubCategory(): void {
    const firstCategory = this.categories[0];
    this.selectedCategoryId = firstCategory._id;
    this.subCategories = firstCategory.subcategories;
    this.selectedSubCategoryId = this.subCategories[0]._id;
    this.filters = this.subCategories[0].filters;
  }

  onCategoryClick(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.updateSubCategories(categoryId);
  }

  private updateSubCategories(categoryId: number): void {
    const selectedCategory = this.findCategoryById(categoryId);
    if (selectedCategory) {
      this.subCategories = selectedCategory.subcategories;
      this.selectedSubCategoryId = this.subCategories[0]._id;
      this.filters = this.subCategories[0].filters
    }
  }

  onSubCategoryClick(subCategoryId: number): void {
    this.selectedSubCategoryId = subCategoryId;
    this.updateFilters(subCategoryId);
  }

  private updateFilters(subCategoryId: number): void {
    const selectedSubCategory = this.findSubCategoryById(subCategoryId);
    if (selectedSubCategory) {
      this.filters = selectedSubCategory.filters;
    }
  }

  private findCategoryById(categoryId: number): Category | undefined {
    return this.categories.find(category => category._id === categoryId);
  }

  private findSubCategoryById(subCategoryId: number): SubCategory | undefined {
    return this.subCategories.find(subCategory => subCategory._id === subCategoryId);
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategoryId === categoryId;
  }

  isSubCategorySelected(subCategoryId: number): boolean {
    return this.selectedSubCategoryId === subCategoryId;
  }
}
