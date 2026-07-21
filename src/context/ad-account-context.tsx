import { create } from "zustand";
import { persist } from "zustand/middleware";

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

export const useAdAccount = create<AdAccountStore>()(
  persist(
    (set) => ({
      accounts: [],
      selected: null,
      setAccounts: (accounts) => set({ accounts }),
      setSelected: (account) => set({ selected: account }),
    }),
    {
      name: "cg_selected_account",
      partialize: (state) => ({ selected: state.selected }),
    }
  )
);
