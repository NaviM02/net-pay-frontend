import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private readonly PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*().?:{}|<>]).{6,}$/;

  private readonly LOWER = 'abcdefghijklmnopqrstuvwxyz';
  private readonly UPPER = this.LOWER.toUpperCase();
  private readonly DIGITS = '0123456789';
  private readonly SPECIALS = '!@#$%^&*().?:{}|<>';
  private readonly ALL = this.LOWER + this.UPPER + this.DIGITS + this.SPECIALS;
  private readonly MIN_LENGTH = 6;

  generateRandomPassword(length: number = this.MIN_LENGTH): string {
    const passwordChars = [
      this.randomChar(this.LOWER),
      this.randomChar(this.UPPER),
      this.randomChar(this.DIGITS),
      this.randomChar(this.SPECIALS),
    ];

    while (passwordChars.length < length) {
      passwordChars.push(this.randomChar(this.ALL));
    }

    for (let i = passwordChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }

    return passwordChars.join('');
  }

  isValid(password: string): boolean {
    return this.PASSWORD_REGEX.test(password);
  }

  private randomChar(chars: string): string {
    return chars[Math.floor(Math.random() * chars.length)];
  }

}
