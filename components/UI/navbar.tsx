import Link from "next/link";
import React, {
  useState,
  useEffect,
  FunctionComponent,
  useContext,
} from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";
import styles from "../../styles/components/navbar.module.css";
import Button from "./button";
import {
  useConnect,
  useAccount,
  useDisconnect,
  useStarkProfile,
} from "@starknet-react/core";
import ModalMessage from "./modalMessage";
import { useDisplayName } from "../../hooks/displayName.tsx";
import { useMediaQuery } from "@mui/material";
import { CircularProgress } from "@mui/material";
import ModalWallet from "./modalWallet";
import { constants } from "starknet";
import { useTheme } from "@mui/material/styles";
import ProfilFilledIcon from "./iconsComponents/icons/profilFilledIcon";
import DesktopNav from "./desktopNav";
import CloseFilledIcon from "./iconsComponents/icons/closeFilledIcon";
import { StarknetIdJsContext } from "../../context/StarknetIdJsProvider";
import { StarkProfile } from "starknetid.js";
import { Connector, useStarknetkitConnectModal } from "starknetkit";
import { getStarknet } from "get-starknet-core";
import { InjectedConnector } from "starknetkit/injected";

const Navbar: FunctionComponent = () => {
  const theme = useTheme();
  const [nav, setNav] = useState<boolean>(false);
  const [desktopNav, setDesktopNav] = useState<boolean>(false);
  const { address, account } = useAccount();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const { connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const isMobile = useMediaQuery("(max-width:425px)");
  const domainOrAddress = useDisplayName(address ?? "", isMobile);
  const network =
    process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "testnet" : "mainnet";
  const [txLoading, setTxLoading] = useState<number>(0);
  const [showWallet, setShowWallet] = useState<boolean>(false);
  const [profile, setProfile] = useState<StarkProfile | undefined>(undefined);
  const { starknetIdNavigator, availableConnectors } =
    useContext(StarknetIdJsContext);
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: availableConnectors,
  });

  // could be replaced by a useProfileData from starknet-react when updated
  useEffect(() => {
    if (starknetIdNavigator !== null && address !== undefined) {
      starknetIdNavigator.getProfileData(address).then(setProfile);
    }
  }, [address]);

  // Autoconnect
  useEffect(() => {
    const connectToStarknet = async () => {
      if (localStorage.getItem("SID-connectedWallet")) {
        const connectordId = localStorage.getItem("SID-connectedWallet");
        const connector = availableConnectors.find(
          (item) => item.id === connectordId
        );
        if (connector) await connectAsync({ connector });
      }
    };
    connectToStarknet();
  }, [availableConnectors]);

  useEffect(() => {
    address ? setIsConnected(true) : setIsConnected(false);
  }, [address]);

  useEffect(() => {
    if (!isConnected || !account) return;
    account.getChainId().then((chainId) => {
      const isWrongNetwork =
        (chainId === constants.StarknetChainId.SN_SEPOLIA &&
          network === "mainnet") ||
        (chainId === constants.StarknetChainId.SN_MAIN &&
          network === "testnet");
      setIsWrongNetwork(isWrongNetwork);
    });
  }, [account, network, isConnected]);

  const connectWallet = async () => {
    const { connector } = await starknetkitConnectModal();
    if (!connector) {
      return;
    }
    await connectAsync({ connector });
    localStorage.setItem("SID-connectedWallet", connector.id);
  };

  function disconnectByClick(): void {
    disconnect();
    setIsConnected(false);
    setIsWrongNetwork(false);
    setShowWallet(false);
    localStorage.removeItem("SID-connectedWallet");
  }

  function handleNav(): void {
    setNav(!nav);
  }

  function handleDesktopNav(): void {
    setDesktopNav(!desktopNav);
  }

  function onTopButtonClick(): void {
    if (!isConnected) {
      connectWallet();
    } else {
      setShowWallet(true);
    }
  }

  function topButtonText(): string | undefined {
    const textToReturn = isConnected ? domainOrAddress : "connect wallet";

    return textToReturn;
  }

  return (
    <>
      <div className={"fixed w-full z-20 bg-background top-0"}>
        <div className={styles.navbarContainer}>
          <div className="ml-4">
            <Link href="/" className="cursor-pointer">
              <img
                className={styles.starknetIdLogo}
                src="/visuals/StarknetIdLogo.svg"
                alt="Starknet.id Logo"
                width={90}
                height={90}
              />
            </Link>
          </div>
          <div>
            <ul className="hidden lg:flex uppercase items-center">
              <Link href="/identities">
                <li className={styles.menuItem}>My Identities</li>
              </Link>
              <Link href="/">
                <li className={styles.menuItem}>Domains</li>
              </Link>
              {/* <Link href="/jointhetribe">
                <li className={styles.menuItem}>Join the tribe</li>
              </Link> */}
              <div
                onClick={handleDesktopNav}
                className={styles.menuBurger}
                aria-expanded={nav}
                id="burger"
              >
                <AiOutlineMenu color={theme.palette.secondary.main} size={25} />
                {desktopNav ? <DesktopNav close={handleDesktopNav} /> : null}
              </div>
              <div className="text-beige mx-5">
                <Button
                  onClick={
                    isConnected
                      ? () => setShowWallet(true)
                      : () => connectWallet()
                  }
                  variation={isConnected ? "white" : "primary"}
                >
                  {isConnected ? (
                    <>
                      {txLoading > 0 ? (
                        <div className="flex justify-center items-center">
                          <p className="mr-3">{txLoading} on hold</p>
                          <CircularProgress
                            sx={{
                              color: theme.palette.secondary.main,
                            }}
                            size={25}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center items-center">
                          <p className="mr-3">{domainOrAddress}</p>
                          {profile?.profilePicture ? (
                            <img
                              src={profile?.profilePicture}
                              width="32"
                              height="32"
                              className="rounded-full"
                            />
                          ) : (
                            <ProfilFilledIcon
                              width="24"
                              color={theme.palette.secondary.main}
                            />
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    "connect"
                  )}
                </Button>
              </div>
            </ul>
            <div onClick={handleNav} className="lg:hidden">
              <AiOutlineMenu
                color={theme.palette.secondary.main}
                size={25}
                className="mr-3"
              />
            </div>
          </div>
        </div>
        <div
          className={
            nav
              ? "lg:hidden fixed left-0 top-0 w-full h-screen bg-black/10 z-10"
              : ""
          }
        >
          <div
            className={`fixed left-0 top-0 w-full sm:w-[60%] lg:w-[45%] h-screen bg-background px-5 ease-in flex justify-between flex-col overflow-auto
              ${nav ? styles.mobileNavbarShown : styles.mobileNavbarHidden}`}
          >
            <div className="h-full flex flex-col">
              <div className={styles.mobileNavBarHeader}>
                <div>
                  <Link href="/" className="cursor-pointer">
                    <img
                      className="cursor-pointer"
                      src="/visuals/StarknetIdLogo.svg"
                      alt="Starknet.id Logo"
                      width={72}
                      height={72}
                    />
                  </Link>
                </div>

                <div
                  onClick={handleNav}
                  className="cursor-pointer p-1 rounded-full"
                >
                  <CloseFilledIcon
                    width="32"
                    color={theme.palette.background.default}
                  />
                </div>
              </div>
              <div className="py-4 my-auto text-center font-extrabold">
                <div>
                  <ul className="uppercase">
                    <Link href="/identities">
                      <li className={styles.menuItemSmall} onClick={handleNav}>
                        My Identities
                      </li>
                    </Link>
                    <Link href="/">
                      <li className={styles.menuItemSmall} onClick={handleNav}>
                        Domains
                      </li>
                    </Link>
                    <Link href="/pfpcollections">
                      <li className={styles.menuItemSmall} onClick={handleNav}>
                        PFP collections
                      </li>
                    </Link>
                    <Link href="/newsletter">
                      <li className={styles.menuItemSmall} onClick={handleNav}>
                        Newsletter
                      </li>
                    </Link>
                    <Link
                      href={process.env.NEXT_PUBLIC_STARKNET_ID as string}
                      target="_blank"
                    >
                      <li className={styles.menuItemSmall} onClick={handleNav}>
                        Website
                      </li>
                    </Link>
                    <Link href="https://docs.starknet.id/" target="_blank">
                      <li className={styles.menuItemSmall} onClick={handleNav}>
                        Documentation
                      </li>
                    </Link>
                    <Link
                      href={`${
                        process.env.NEXT_PUBLIC_STARKNET_ID as string
                      }/affiliates/individual-program`}
                      target="_blank"
                    >
                      <li className={styles.menuItemSmall} onClick={handleNav}>
                        Affiliation
                      </li>
                    </Link>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center my-4 w-full">
              <div className="text-background">
                <Button onClick={onTopButtonClick}>{topButtonText()}</Button>
              </div>
              <div className="flex">
                <div className="rounded-full shadow-gray-400 p-3 cursor-pointer hover:scale-105 ease-in duration-300 mt-2">
                  <Link href="https://twitter.com/Starknet_id" target="_blank">
                    <FaTwitter size={28} color={theme.palette.grey[800]} />
                  </Link>
                </div>
                <div className="rounded-full shadow-gray-400 p-3 cursor-pointer hover:scale-105 ease-in duration-300 mt-2">
                  <Link
                    href="https://discord.com/invite/8uS2Mgcsza"
                    target="_blank"
                  >
                    <FaDiscord size={28} color={theme.palette.grey[800]} />
                  </Link>
                </div>
                <div className="rounded-full shadow-gray-400 p-3 cursor-pointer hover:scale-105 ease-in duration-300 mt-2">
                  <Link href="https://github.com/starknet-id" target="_blank">
                    <FaGithub size={28} color={theme.palette.grey[800]} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalMessage
        open={isWrongNetwork}
        title={"Wrong network"}
        closeModal={() => setIsWrongNetwork(false)}
        message={
          <div className="mt-3 flex flex-col items-center justify-center text-center">
            <p>
              This app only supports Starknet {network}, you have to change your
              network to be able use it.
            </p>
            <div className="mt-3">
              <Button onClick={() => disconnectByClick()}>
                {`Disconnect`}
              </Button>
            </div>
          </div>
        }
      />
      <ModalWallet
        domain={domainOrAddress}
        open={showWallet}
        closeModal={() => setShowWallet(false)}
        disconnectByClick={disconnectByClick}
        setTxLoading={setTxLoading}
      />
    </>
  );
};

export default Navbar;
