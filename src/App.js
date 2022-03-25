import "./App.css";
import { useEffect, useState } from "react";
import NftToken from "./NftToken";

const nftFilter = {
  status: "SUCCESS",
  event: {
    standard: "nep171",
    event: "nft_mint",
  },
};

function listenToNFT(processEvents) {
  const ws = new WebSocket("wss://events.near.stream/ws");

  ws.onopen = () => {
    console.log(`Connection to WS has been established`);
    ws.send(
      JSON.stringify({
        secret: "ohyeahnftsss",
        filter: nftFilter,
        fetch_past_events: 10,
      })
    );
  };
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    processEvents(data.events);
  };
  ws.onerror = (err) => {
    console.log("WebSocket error", err);
  };
}

// async function fetchEvents() {
//   const res = await fetch("https://events.near.stream/events", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       filter: nftFilter,
//       limit: 10,
//     }),
//   });
//   try {
//     const response = await res.json();
//     return response.events;
//   } catch (e) {
//     console.log(e);
//     return [];
//   }
// }

function processEvent(event) {
  return (event?.event?.data[0]?.token_ids || []).map((tokenId) => ({
    time: new Date(parseFloat(event.block_timestamp) / 1e6),
    contractId: event.account_id,
    ownerId: event.event.data[0].owner_id,
    tokenId,
  }));
}

function App() {
  const [nfts, setNfts] = useState([]);

  // Setting up NFTs
  useEffect(() => {
    const processEvents = (events) => {
      // console.log(events);
      events = events.flatMap(processEvent);
      events.reverse();
      setNfts((prevState) => {
        const newNfts = [...events, ...prevState];
        return newNfts.slice(0, 100);
      });
    };

    // fetchEvents().then(processEvents);
    listenToNFT(processEvents);
  }, []);

  return (
    <div>
      <h1>NFT mints in realtime</h1>
      <div className="card-wrapper">
        {nfts.map((nft) => {
          return (
            <NftToken key={`${nft.contractId}:${nft.tokenId}`} nft={nft} />
          );
        })}
      </div>
    </div>
  );
}

export default App;
