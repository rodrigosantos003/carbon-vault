import { Component } from '@angular/core';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: false
})
export class CartComponent {
  constructor() { }

  incrementQuantity(item: any) {
    item.quantity++;
  }

  decrementQuantity(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
    }
    else {
      this.removeItem(item);
    }
  }

  removeItem(item: any) {
    if(!confirm('Pretende eliminar o item?'))
      return;

      this.cartItems = this.cartItems.filter(i => i.id !== item.id);
      const index = this.cartItems.indexOf(item);
      this.cartItems.splice(index, 1);
  }

  cartItems = [
    {
      id: 1,
      image: 'https://picsum.photos/200',
      name: 'Item 1',
      price: 100,
      quantity: 2,
    },
    {
      id: 2,
      image: 'https://picsum.photos/200',
      name: 'Item 2',
      price: 200,
      quantity: 3
    },
    {
      id: 3,
      image: 'https://picsum.photos/200',
      name: 'Item 3',
      price: 300,
      quantity: 1
    }
  ];
}
