import { useEffect, useCallback, useState } from "react";
import { useMagic } from "../magic/MagicProvider";
import { getNetworkUrl } from "@/utils/network";
import { Safe4337Pack } from "@safe-global/relay-kit";

export const useSafeProvider = () => {
  const { magic } = useMagic();
  const [smartClient, setSmartClient] = useState<Safe4337Pack>();
  const connectToSmartContractAccount = useCallback(async () => {
    if (!magic) return;
    const user = await magic.user.getMetadata();

    const client = await Safe4337Pack.init({
      provider: getNetworkUrl(),
      rpcUrl: getNetworkUrl(),
      bundlerUrl: `https://api.pimlico.io/v1/sepolia/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`,
      options: {
        owners: [user.publicAddress || ""],
        threshold: 1,
      },
    });

    setSmartClient(client);
  }, [magic]);

  useEffect(() => {
    if (magic?.user.isLoggedIn) {
      connectToSmartContractAccount();
    }
  }, [magic?.user.isLoggedIn, connectToSmartContractAccount]);

  // Returns the SmartClient for use in components.
  return {
    smartClient,
  };
};
