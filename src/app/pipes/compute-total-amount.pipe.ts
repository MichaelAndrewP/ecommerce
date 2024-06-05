import { Pipe, PipeTransform } from '@angular/core';
import { DocumentData } from 'rxfire/firestore/interfaces';

@Pipe({
  name: 'computeTotalAmount',
})
export class ComputeTotalAmountPipe implements PipeTransform {
  /* private cache = new Map<string, number>(); */
  transform(value: DocumentData[] | null): number {
    let totalAmount = 0;
    if (value) {
      value.forEach((item: any) => {
        totalAmount += item.rowTotal;
      });
    }
    return totalAmount;
  }
}
