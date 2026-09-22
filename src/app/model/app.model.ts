import { ChargeStatusEnum } from './payment.enum';

export class AuthRequestDto {
  public email!: string;
  public password!: string;
  public fingerprint!: string;
}

export class AdmTypology {
  public typologyId!: number;
  public parentTypologyId!: number;
  public internalId!: number;
  public description!: string;
  public value1!: string;
  public value2!: string;
}

export class AppUser {
  public id!: number;
  public hashId!: string;
  public email!: string;
  public password!: string;
  public fullName!: string;/*
  public phoneNumber!: string;*/
  public tpStatus!: AdmTypology;
  public tpRole!: AdmTypology;
  public entryDate!: string;
  public lastLoginAt!: string;
}

export class AppToken {
  public authc!: string;
}

export class AppService {
  public id!: number;
  public hashId!: string;
  public name!: string;
  public speed!: string;
  public monthlyPrice!: number;
  public tpType!: AdmTypology;
  public tpStatus!: AdmTypology;
}

export class PaymentAllocation {
  public chargeHashId!: string;
  public year!: number;
  public month!: number;
  public periodLabel!: string;
  public amount!: number;
}

export class AppPayment {
  public hashId!: string;
  public client: AppClient | null = null;
  public amount!: number;
  public paidAt!: string;
  public tpPaymentMethod!: AdmTypology;
  public tpPaymentStatus!: AdmTypology;
  public reference!: string;
  public comment!: string;
  public collector: AppUser | null = null;
  public allocations: PaymentAllocation[] = [];
  public createdAt!: string;
}

export class AppClientCharge {
  public hashId!: string;
  public year!: number;
  public month!: number;
  public periodLabel!: string;
  public expectedAmount!: number;
  public paidAmount!: number;
  public balance!: number;
  public status!: ChargeStatusEnum;
  public overdue!: boolean;
}

export class AppClientAccount {
  public clientHashId!: string;
  public totalExpected!: number;
  public totalPaid!: number;
  public balance!: number;
  public credit!: number;
  public overdueCount!: number;
  public charges: AppClientCharge[] = [];
}

export class AppClient {
  public id!: number;
  public hashId!: string;
  public businessName!: string;
  public contactName!: string;
  public contactEmail!: string;
  public contactPhone!: string;
  public address!: string;
  public latitude: number | null = null;
  public longitude: number | null = null;
  public customerSince!: string;
  public tpStatus!: AdmTypology;
  public service: AppService | null = null;
  public collector: AppUser | null = null;
  public createdAt!: string;
  public updatedAt!: string;
}
