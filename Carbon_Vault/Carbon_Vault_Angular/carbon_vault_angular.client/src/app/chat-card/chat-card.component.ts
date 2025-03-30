import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chat-card',
  standalone: false,
  
  templateUrl: './chat-card.component.html',
  styleUrl: './chat-card.component.css'
})
export class ChatCardComponent {
    @Input() addedAt!: string;
    @Input() name!: string;
    @Input() content!: string;
    @Input() isAuthor!: boolean;
    @Input() isLast!: boolean;
}
