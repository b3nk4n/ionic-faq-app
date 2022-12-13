import { useState, useEffect } from "react";

import { Storage } from "@ionic/storage";

export const useStorage = (): Storage | null => {
  const [store, setStore] = useState<Storage | null>(null);

  useEffect(() => {
    const init = async () => {
      const storage = new Storage();
      const createdStore = await storage.create();
      setStore(createdStore);
    };

    init();
  }, []);

  return store;
};
