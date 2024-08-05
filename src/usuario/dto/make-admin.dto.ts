import { IsNumber } from "class-validator";

export class MakeAdminDto {
    @IsNumber()
    requester: number;

    @IsNumber()
    newAdmin: number;
}