import { useEffect, useCallback, useState } from "react";
import { useMagic } from "../magic/MagicProvider";
import { getBundlerUrl, getNetworkUrl } from "@/utils/network";
import { SmartAccountClient } from "permissionless";
import { providerToSmartAccountSigner } from "permissionless";
import {
  ENTRYPOINT_ADDRESS_V07,
  createSmartAccountClient,
} from "permissionless";
import { signerToSafeSmartAccount } from "permissionless/accounts";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { http } from "viem";
import { sepolia } from "viem/chains";
import { ENTRYPOINT_ADDRESS_V07_TYPE } from "permissionless/_types/types";

export const useSafeProvider = () => {
  const { magic, publicClient } = useMagic();
  const [smartClient, setSmartClient] =
    useState<SmartAccountClient<ENTRYPOINT_ADDRESS_V07_TYPE>>();
  const connectToSmartContractAccount = useCallback(async () => {
    if (!magic || !publicClient) return;

    const magicProvider = await magic.wallet.getProvider();
    const smartAccountSigner =
      await providerToSmartAccountSigner(magicProvider);

    const smartAccount = await signerToSafeSmartAccount(publicClient, {
      signer: smartAccountSigner,
      safeVersion: "1.4.1",
      entryPoint: ENTRYPOINT_ADDRESS_V07,
    });

    const pimlicoBundlerClient = createPimlicoBundlerClient({
      transport: http(getBundlerUrl()),
      entryPoint: ENTRYPOINT_ADDRESS_V07,
    });

    const smartAccountClient = createSmartAccountClient({
      account: smartAccount,
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      chain: sepolia,
      bundlerTransport: http(getBundlerUrl()),
      middleware: {
        gasPrice: async () =>
          (await pimlicoBundlerClient.getUserOperationGasPrice()).standard, // if using pimlico bundler
      },
    });

    setSmartClient(smartAccountClient);
  }, [magic, publicClient]);

  useEffect(() => {
    if (magic?.user.isLoggedIn) {
      connectToSmartContractAccount();
    }
  }, [magic?.user.isLoggedIn, connectToSmartContractAccount]);

  return {
    smartClient,
  };
};
