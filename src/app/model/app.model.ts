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
