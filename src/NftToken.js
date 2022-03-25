import React, { useEffect, useState } from "react";
import { useNear } from "./data/near";
import { keysToCamel } from "./data/utils";

const metadataCache = {};

async function fetchNftData(near, nft) {
  try {
    const nftMetadata = await (nft.contractId in metadataCache
      ? metadataCache[nft.contractId]
      : (metadataCache[nft.contractId] = near
          .viewCall(nft.contractId, "nft_metadata", {})
          .then(keysToCamel)));

    const nftToken = keysToCamel(
      await near.viewCall(nft.contractId, "nft_token", {
        token_id: nft.tokenId,
      })
    );


    let tokenMetadata = nftToken?.metadata;
    let tokenMedia = tokenMetadata?.media || "";

    const imageUrl =
      tokenMedia.startsWith("https://") ||
      tokenMedia.startsWith("http://") ||
      tokenMedia.startsWith("data:image")
        ? tokenMedia
        : nftMetadata.baseUri
        ? `${nftMetadata.baseUri}/${tokenMedia}`
        : tokenMedia.startsWith("Qm")
        ? `https://cloudflare-ipfs.com/ipfs/${tokenMedia}`
        : tokenMedia;

    const mjolnearUrl = `https://mjolnear.com/#/nfts/${nft.contractId}/${nft.tokenId}`;
    const parasUrl = `https://paras.id/token/${nft.contractId}/${nft.tokenId}`;
    const parasOwnerUrl = `https://paras.id/${nft.ownerId}/collectibles`;
    const parasCollectionUrl = `https://paras.id/collection/${nft.contractId}`;

    return {
      title: tokenMetadata?.title,
      description: tokenMetadata.description || nftMetadata.name,
      ownerId: nft.ownerId,
      contractId: nft.contractId,
      parasOwnerUrl,
      parasCollectionUrl,
      imageUrl,
      mjolnearUrl,
      parasUrl,
      nft,
      nftToken,
      nftMetadata,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default function NftToken(props) {
  const [nftData, setNftData] = useState(null);
  const near = useNear();
  const nft = props.nft;

  useEffect(() => {
    if (near && nft) {
      fetchNftData(near, nft).then(setNftData);
    }
  }, [near, nft]);

  return nftData ? (
    <div className="card">
      <div className="card__head">
        <a target="_blank" rel="noreferrer" href={nftData.imageUrl}>
          <div className="card__product-img">
            <img src={nftData.imageUrl} alt={nftData.title} />
          </div>
        </a>
      </div>

      <div className="card__body">
        <a target="_blank" rel="noreferrer" href={nftData.parasUrl}>
          <h3 className="card__title">{nftData.title}</h3>
        </a>

        <p className="card__text">{nftData.description}</p>

        <div className="wrapper">
          <div className="card__owner">
            <a target="_blank" rel="noreferrer" href={nftData.parasOwnerUrl}>
              {nftData.ownerId}
            </a>
          </div>

          <div className="card__contract">
            <a
              target="_blank"
              rel="noreferrer"
              href={nftData.parasCollectionUrl}
            >
              {nftData.contractId}
            </a>
          </div>
        </div>
      </div>
      <div className="card__footer">
        <a target="_blank" rel="noreferrer" href={nftData.mjolnearUrl}>
          MjolNear
        </a>
        <a target="_blank" rel="noreferrer" href={nftData.parasUrl}>
          Paras
        </a>
      </div>
    </div>
  ) : (
    <div>Loading</div>
  );
}
