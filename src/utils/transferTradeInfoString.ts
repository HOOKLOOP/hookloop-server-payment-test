import { IPaymentTradeInfoType } from "@/types";

const transferTradeInfoString = (tradeInfo: IPaymentTradeInfoType): string => {
  // 特殊符號 與 中文字 要轉成編碼
  const dataString = Object.entries(tradeInfo)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return dataString;
};

export default transferTradeInfoString;
