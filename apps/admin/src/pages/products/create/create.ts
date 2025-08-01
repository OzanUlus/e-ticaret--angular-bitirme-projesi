//import { Location } from '@angular/common';
import { HttpClient, httpResource } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  resource,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Blank from 'apps/admin/src/components/blank';
import { FlexiToastService } from 'flexi-toast';
import { NgxMaskDirective } from 'ngx-mask';
import { lastValueFrom } from 'rxjs';
import { initialProduct, ProductModel } from '../products';
import { CategoryModel } from '../../categories/categories';
import { FlexiSelectModule } from 'flexi-select';

@Component({
  imports: [Blank, FormsModule, NgxMaskDirective, FlexiSelectModule],
  templateUrl: './create.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProductCreate {
  readonly id = signal<string | undefined>(undefined);
  readonly result = resource({
    params: () => this.id(),
    loader: async () => {
      var res = lastValueFrom(
        this.#http.get<ProductModel>(`api/products/${this.id()}`)
      );
      return res;
    },
  });
  readonly data = linkedSignal(() => this.result.value() ?? { ...initialProduct });
  readonly cardTitle = computed(() =>
    this.id() ? 'Ürün Güncelle' : 'Ürün Ekle'
  );
  readonly btnName = computed(() => (this.id() ? 'Güncelle' : 'Ürün Ekle'));

  readonly categoryResult = httpResource<CategoryModel[]>(
    () => 'api/categories'
  );
  readonly categories = computed(() => this.categoryResult.value() ?? []);
  readonly categoryLoading = computed(() => this.categoryResult.isLoading());

  

  readonly #http = inject(HttpClient);
  readonly #router = inject(Router);
  readonly #toast = inject(FlexiToastService);
  readonly #activate = inject(ActivatedRoute);
  //readonly #location = inject(Location)

  constructor() {
    this.#activate.params.subscribe((res) => {
      if (res['id']) {
        this.id.set(res['id']);
      }
    });
  }
  save(form: NgForm) {
    if (!form.valid) return;

    if (!this.id()) {
      this.#http.post('api/products', this.data()).subscribe(() => {
        this.#router.navigateByUrl('/products');
        //this.#location.back(); geldiğin sayfaya döner
        this.#toast.showToast('Başarılı', 'Ürün başarıyla eklendi.', 'success');
      });
    } else {
      this.#http.put(`api/products/${this.id()}`, this.data()).subscribe(() => {
        this.#router.navigateByUrl('/products');
        //this.#location.back(); geldiğin sayfaya döner
        this.#toast.showToast(
          'Başarılı',
          'Ürün başarıyla güncellendi.',
          'info'
        );
      });
    }
  }
   setCategoryName(){
    const id = this.data().categoryId;
    const category = this.categories().find(p => p.id == id);
    this.data.update((prev) => ({...prev, categoryName: category?.name ?? ""}))
  }
}
