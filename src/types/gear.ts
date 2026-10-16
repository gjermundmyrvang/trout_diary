export type GearSet = {
  id: string;
  user_id: string;
  name: string;
  rod: string | null;
  reel: string | null;
  line: string | null;
  notes: string | null;
  created_at: string;
};

export type NewGearSet = {
  name: string;
  rod?: string | null;
  reel?: string | null;
  line?: string | null;
  notes?: string | null;
};
