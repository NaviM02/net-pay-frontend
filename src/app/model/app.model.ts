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
