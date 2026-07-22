import { create } from "zustand";

export type AccountStatus = "synced" | "syncing" | "unsynced";

export type AdAccount = {
  ad_account_id: string;
  name: string;
  status: AccountStatus;
  synced_account_id?: string;
  sync_had_errors?: boolean;
  last_synced_at?: string | null;
  synced_by?: { name: string };
  started_by?: { name: string };
  currency?: string;
};

type AdAccountStore = {
  accounts: AdAccount[];
  selected: AdAccount | null;
  setAccounts: (accounts: AdAccount[]) => void;
  setSelected: (account: AdAccount | null) => void;
};

export const useAdAccount = create<AdAccountStore>()((set) => ({
  accounts: [],
  selected: null,
  setAccounts: (accounts) => set({ accounts }),
  setSelected: (account) => set({ selected: account }),
}));
