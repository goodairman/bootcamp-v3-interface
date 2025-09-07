"use client"

import { useState } from "react"

import { useEffect } from "react"
import Image from "next/image"
import { useSDK } from "@metamask/sdk-react"
import Jazzicon from "react-jazzicon"
import { ethers } from "ethers"

// Import hooks
import { useProvider } from "@/app/hooks/useProvider"

// Import assets
import network from "@/app/assets/other/network.svg"

import config from "@/app/config.json"

function TopNav() {

  const { sdk, provider: metamask, chainId } = useSDK()
  const { provider } = useProvider()

  const [account, setAccount] = useState("")
  const [balance, setBalance] = useState("")

  async function connectHandler() {
    try {
      await sdk.connectAndSign({ msg: "Sign in to DAPP Exchange" })
      await getAccountInfo()
    } catch (error) {
      console.log(error)
    }
  }

  async function networkHandler(e) {
    await metamask.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: e.target.value }],
    })
  }

  async function getAccountInfo() {
    // Get the currently connected account & balance
    const account = await provider.getSigner()
    const balance = await provider.getBalance(account)

    // Store the values in the state
    setAccount(account.address)
    setBalance(ethers.formatUnits(balance, 18))
  }

  useEffect(() => {
    if(sdk && metamask) {
      // Create an event listener to listen for new orders created
      metamask.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          // No accounts are connected
          setAccount(null)
          setBalance(0)
        } else {
          await getAccountInfo()
        }
      })

      metamask.on("chainChanged", () => window.location.reload())

      // This allows us to remove any duplicate event
      // listeners that may be added from navigating
      // back and forth to this page
      return () => {
        metamask.removeAllListeners()
      }
    }
  })

  return(
    <nav className="topnav">
      <div className="network">
        <label className="icon" htmlFor="network">
          <Image src={network} alt="Select network" />
        </label>
        <div className="select">
          <select
            name="network"
            id="network"
            value={config[Number(chainId)] ? chainId : 0}
            onChange={networkHandler}
          >
            <option value="0">Select</option>
            <option value={"0x7a69"}>Hardhet</option>
          </select>
        </div>
      </div>

      <div className="account">
        {account && (
          <div className="balance">
            <p>My Balance <span>{Number(balance).toFixed(2)} ETH</span></p>
          </div>
        )}

        {account ? (
          // show account
          <a href={`https://etherscan.io/address/${account}`}
             target="_blank"
             rel="noreferrer"
             className="link"
          >
            {account.slice(0, 6)}...{account.slice(-4)}
            <Jazzicon diameter={44} seed={account} />
          </a>
        ) : (
          <button onClick={connectHandler} className="button">
            Connect
          </button>
        )}

      </div>
    </nav>
  );
}

export default TopNav;
