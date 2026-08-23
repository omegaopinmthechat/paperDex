/**
 * Sends a pre-built contract transaction and waits for 1 confirmation.
 * Returns { txHash, blockNumber, receipt }.
 */
export const sendAndWait = async (txPromise) => {
  const tx = await txPromise;
  const receipt = await tx.wait(1);
  return { txHash: receipt.hash, blockNumber: Number(receipt.blockNumber), receipt };
};
