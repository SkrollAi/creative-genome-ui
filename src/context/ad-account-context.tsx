import { create } from "zustand";

export type AdAccount = {
  ad_account_id: string;
  name: string;
  is_synced: boolean;
  is_syncing: boolean;
  sync_had_errors: boolean;
  currency: string;
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
