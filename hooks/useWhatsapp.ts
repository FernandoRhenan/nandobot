import { useCallback, useEffect, useState } from "react";
import {
  IWhatsappGroup,
  IWhatsappGroupsResponse,
} from "@/app/api/v1/whatsapp/groups/route";
import { IResponse } from "@/infra/responses";
import type { ConnectionStatus } from "@/infra/baileys";
import { IPostMessageInGroups } from "@/models/publisher";
import { getSocket } from "@/infra/socket/client";
import ResponseFilter from "@/helpers/ResponseFilter";
import { RadioOption } from "@/components/radioSelector";
import Algorithms from "@/helpers/Algorithms";

export type PostSorting = "random" | "ordered";

export const postSortingOptions: RadioOption<PostSorting>[] = [
  {
    value: "ordered",
    label: "Ordenado",
  },
  {
    value: "random",
    label: "Aleatório",
  },
];

function useWhatsapp() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("close");
  const [groups, setGroups] = useState<IWhatsappGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [sort, setSort] = useState<PostSorting>("random");

  const getGroups = useCallback(async () => {
    const response = await fetch("/api/v1/whatsapp/groups");
    const body: IResponse<IWhatsappGroupsResponse> = await response.json();
    const parsed = ResponseFilter.parse(body);
    setGroups(parsed?.data?.groups ?? []);
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleStatus = (next: ConnectionStatus) => {
      setStatus(next);
      if (next === "open") getGroups();
    };

    socket.on("whatsapp:qr", setQrCode);
    socket.on("whatsapp:status", handleStatus);

    return () => {
      socket.off("whatsapp:qr", setQrCode);
      socket.off("whatsapp:status", handleStatus);
    };
  }, [getGroups]);

  function connect() {
    getSocket().emit("whatsapp:connect");
  }

  function disconnect() {
    getSocket().emit("whatsapp:disconnect");
    setGroups([]);
    setSelectedGroupIds([]);
  }

  async function sendGroupMessages(items: IPostMessageInGroups) {
    if (sort === "random") {
      items.productsId = Algorithms.shuffleNumbers(items.productsId);
    }

    const response = await fetch("/api/v1/whatsapp/send/group-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productsId: items.productsId,
        groupsId: items.groupsId,
        interval: items.interval,
      }),
    });
    const body: IResponse<undefined> = await response.json();
    ResponseFilter.parse(body);
  }

  return {
    connect,
    qrCode,
    status,
    groups,
    getGroups,
    selectedGroupIds,
    setSelectedGroupIds,
    sendGroupMessages,
    disconnect,
    sort,
    setSort,
  };
}

export default useWhatsapp;
