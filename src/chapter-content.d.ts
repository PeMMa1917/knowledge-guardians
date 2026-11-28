declare module 'virtual:kg-chapters' {
  export const origins: import('./domain/types').OriginRecord[];
  export const MAPS: Record<
    string,
    import('./app/publishedCampaign').RoomHeading
  >;
  export function room(id: string): import('./maps/types').MapDef;
  export function buildPack(): import('./domain/types').ContentPack;
  export function prepareCore(): Promise<void>;
  export function prepareMap(id: string): Promise<void>;
  export function pendingHint(objective: string): Promise<void> | undefined;
  export function pendingNode(id: string): Promise<void> | undefined;
}
