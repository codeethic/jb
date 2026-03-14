export interface Pairing {
    id: string;
    foodItemId: string;
    wineItemId: string;
    pairingNote?: string;
    restaurantId: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreatePairingDto {
    foodItemId: string;
    wineItemId: string;
    pairingNote?: string;
}
export interface UpdatePairingDto extends Partial<CreatePairingDto> {
}
//# sourceMappingURL=pairing.d.ts.map