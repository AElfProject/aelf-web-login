import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type WalletAdapter,
  utils,
  enhancedLocalStorage,
  PORTKEYAA,
  OperationTypeEnum,
  GUARDIAN_LIST_FOR_LOGIN,
} from '@aelf-web-login/wallet-adapter-base';
import type { Bridge } from './bridge';
import {
  CommonBaseModal,
  PortkeyLoading,
  SignIn,
  Unlock,
  type DIDWalletInfo,
  TelegramPlatform,
  type CreatePendingInfo,
  setLoading,
  GuardianApprovalModal,
  getOperationDetails,
  ConfigProvider,
  type Theme,
  CommonModal,
  CustomSvg,
} from '@portkey/did-ui-react';
import '@portkey/did-ui-react/dist/assets/index.css';
import type { IBaseConfig } from './';
import { Modal, Button, Drawer, theme } from 'antd';
import useTelegram from './useTelegram';
import './ui.css';
import { EE, SET_GUARDIAN_APPROVAL_MODAL } from './utils';

export interface IConfirmLogoutDialogProps {
  title: string;
  subTitle: string[];
  tipIcon?: string;
  sdkTheme: Theme;
  okTxt: string;
  cancelTxt: string;
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  width: number;
  mobileWidth: number;
}

const defaultPropsForSocialDesign = {
  titleForSocialDesign: 'Crypto wallet',
  iconSrcForSocialDesign:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9IkVsZiBFeHBsb3JlciI+CjxyZWN0IHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgZmlsbD0id2hpdGUiLz4KPHBhdGggaWQ9IlNoYXBlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTMwLjAwMDMgMTEuODQyQzMzLjEwNjkgMTEuODQyIDM1LjYyNTIgOS4zMjM3MSAzNS42MjUyIDYuMjE3MTlDMzUuNjI1MiAzLjExMDY4IDMzLjEwNjkgMC41OTIzNDYgMzAuMDAwMyAwLjU5MjM0NkMyNi44OTM4IDAuNTkyMzQ2IDI0LjM3NTUgMy4xMTA2OCAyNC4zNzU1IDYuMjE3MTlDMjQuMzc1NSA5LjMyMzcxIDI2Ljg5MzggMTEuODQyIDMwLjAwMDMgMTEuODQyWk01NS40MDkzIDI4LjAzNzhDNTUuNDA5MyAzNC4zNTc5IDUwLjI4NTggMzkuNDgxNCA0My45NjU3IDM5LjQ4MTRDMzcuNjQ1NSAzOS40ODE0IDMyLjUyMiAzNC4zNTc5IDMyLjUyMiAyOC4wMzc4QzMyLjUyMiAyMS43MTc2IDM3LjY0NTUgMTYuNTk0MSA0My45NjU3IDE2LjU5NDFDNTAuMjg1OCAxNi41OTQxIDU1LjQwOTMgMjEuNzE3NiA1NS40MDkzIDI4LjAzNzhaTTM1LjYyNTIgNDkuODU4MkMzNS42MjUyIDUyLjk2NDggMzMuMTA2OSA1NS40ODMxIDMwLjAwMDMgNTUuNDgzMUMyNi44OTM4IDU1LjQ4MzEgMjQuMzc1NSA1Mi45NjQ4IDI0LjM3NTUgNDkuODU4MkMyNC4zNzU1IDQ2Ljc1MTcgMjYuODkzOCA0NC4yMzM0IDMwLjAwMDMgNDQuMjMzNEMzMy4xMDY5IDQ0LjIzMzQgMzUuNjI1MiA0Ni43NTE3IDM1LjYyNTIgNDkuODU4MlpNMS4xOTczMyAxMi4yM0MtMC40NTEzMzEgMTYuNTk0MSAxLjg3NjE5IDIxLjU0MDEgNi4yNDAzIDIzLjE4ODdDOS4xNDk3IDI0LjI1NTUgMTIuMjUzMSAyMy42NzM2IDE0LjQ4MzYgMjEuODMxQzE2LjUyMDIgMjAuMzc2MyAxOS4xMzg3IDE5Ljg5MTQgMjEuNjYwMSAyMC44NjEyQzIzLjMwODggMjEuNDQzMSAyNC41Njk1IDIyLjUwOTkgMjUuNDQyNCAyMy44Njc2TDI1LjUzOTMgMjQuMDYxNUMyNS45MjczIDI0LjY0MzQgMjYuNTA5MSAyNS4yMjUzIDI3LjI4NSAyNS40MTkzQzI5LjAzMDYgMjYuMDk4MSAzMS4wNjcyIDI1LjEyODMgMzEuNjQ5MSAyMy4zODI3QzMyLjMyOCAyMS42MzcgMzEuMzU4MiAxOS42MDA1IDI5LjYxMjUgMTkuMDE4NkMyOC44MzY3IDE4LjcyNzYgMjguMDYwOCAxOC43Mjc2IDI3LjI4NSAxOS4wMTg2QzI1LjczMzMgMTkuNTAzNSAyMy45ODc3IDE5LjUwMzUgMjIuMzM5IDE4LjkyMTZDMTkuOTE0NSAxOC4wNDg4IDE4LjI2NTggMTYuMTA5MiAxNy41ODcgMTMuODc4NkwxNy40OSAxMy42ODQ3QzE3LjQ5IDEzLjU4NzcgMTcuNDkgMTMuNDkwNyAxNy4zOTMgMTMuNDkwN1YxMy4yOTY4QzE2LjcxNDIgMTAuNTgxMyAxNC44NzE1IDguMjUzNzggMTIuMDU5MSA3LjI4Mzk4QzcuNjk1IDUuNTM4MzQgMi43NDkwMSA3Ljc2ODg4IDEuMTk3MzMgMTIuMjNaTTYuMjQwMyAzMi44ODY4QzEuODc2MTkgMzQuNTM1NCAtMC40NTEzMzEgMzkuNDgxNCAxLjE5NzMzIDQzLjg0NTVDMi44NDU5OSA0OC4zMDY2IDcuNjk1IDUwLjUzNzIgMTIuMDU5MSA0OC43OTE1QzE0Ljg3MTUgNDcuODIxNyAxNi43MTQyIDQ1LjQ5NDIgMTcuMzkzIDQyLjc3ODdWNDIuNTg0OEMxNy40OSA0Mi41ODQ4IDE3LjQ5IDQyLjQ4NzggMTcuNDkgNDIuMzkwOEwxNy41ODcgNDIuMTk2OUMxOC4yNjU4IDM5Ljk2NjMgMTkuOTE0NSAzOC4wMjY3IDIyLjMzOSAzNy4xNTM5QzIzLjk4NzcgMzYuNTcyIDI1LjczMzMgMzYuNTcyIDI3LjI4NSAzNy4wNTY5QzI4LjA2MDggMzcuMzQ3OSAyOC44MzY3IDM3LjM0NzkgMjkuNjEyNSAzNy4wNTY5QzMxLjM1ODIgMzYuNDc1IDMyLjMyOCAzNC40Mzg1IDMxLjY0OTEgMzIuNjkyOEMzMS4wNjcyIDMwLjk0NzIgMjkuMDMwNiAyOS45Nzc0IDI3LjI4NSAzMC42NTYyQzI2LjUwOTEgMzAuODUwMiAyNS45MjczIDMxLjQzMjEgMjUuNTM5MyAzMi4wMTRMMjUuNDQyNCAzMi4yMDc5QzI0LjU2OTUgMzMuNTY1NiAyMy4zMDg4IDM0LjYzMjQgMjEuNjYwMSAzNS4yMTQzQzE5LjEzODcgMzYuMTg0MSAxNi41MjAyIDM1LjY5OTIgMTQuNDgzNiAzNC4yNDQ1QzEyLjI1MzEgMzIuNDAxOSA5LjE0OTcgMzEuODIgNi4yNDAzIDMyLjg4NjhaIiBmaWxsPSIjMjY2Q0QzIi8+CjwvZz4KPC9zdmc+Cg==',
};

const constant = {
  leftImg:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9ImRpcmVjdGlvbi9sZWZ0Ij4KPGcgaWQ9IlVuaW9uIj4KPHBhdGggZD0iTTcuOTA5NjUgMTIuMDAyMkwxNS40NDc0IDE5LjU0QzE1LjU2NDYgMTkuNjU3MSAxNS41NjQ2IDE5Ljg0NzEgMTUuNDQ3NCAxOS45NjQzTDE0LjM4NjggMjEuMDI0OUMxNC4yNjk2IDIxLjE0MjEgMTQuMDc5NiAyMS4xNDIxIDEzLjk2MjUgMjEuMDI0OUw1LjQ2OTY3IDEyLjUzMjFDNS4xNzY3OCAxMi4yMzkyIDUuMTc2NzggMTEuNzY0MyA1LjQ2OTY3IDExLjQ3MTRMMTMuOTYzNSAyLjk3ODQ5QzE0LjA4MDcgMi44NjEzNCAxNC4yNzA2IDIuODYxMzQgMTQuMzg3OCAyLjk3ODQ5TDE1LjQ0ODUgNC4wMzkxNUMxNS41NjU2IDQuMTU2MzEgMTUuNTY1NiA0LjM0NjI2IDE1LjQ0ODUgNC40NjM0Mkw3LjkwOTY1IDEyLjAwMjJaIiBmaWxsPSIjNTE1QTYyIi8+CjwvZz4KPC9nPgo8L3N2Zz4K',
  rightImg:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9Ikljb24gLyBMaW5lIC8gTGVmdCYjMjI5OyYjMTY0OyYjMTM1OyYjMjI4OyYjMTg3OyYjMTg5OyI+CjxwYXRoIGlkPSJTaGFwZSIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zIDExLjEzOThWMTAuMTAzNkMzIDEwLjAzMzIgMy4wMjkzIDkuOTY2ODQgMy4wNzczNCA5LjkyNTM5TDcuNjY2NDEgNi4wMDAyNkwzLjA3NzM0IDIuMDc1MTNDMy4wMjkzIDIuMDMzNjggMyAxLjk2NzM3IDMgMS44OTY5VjAuODYwNzAzQzMgMC43NzA4OTkgMy4wODY3MiAwLjcxODM5OCAzLjE0ODgzIDAuNzcwODk5TDguODQ1MzEgNS42NDI0M0M5LjA1MTU2IDUuODE5MjcgOS4wNTE1NiA2LjE4MTI1IDguODQ1MzEgNi4zNTY3MkwzLjE0ODgzIDExLjIyODJDMy4wODY3MiAxMS4yODIxIDMgMTEuMjI5NiAzIDExLjEzOThaIiBmaWxsPSIjNTE1QTYyIi8+CjwvZz4KPC9zdmc+Cg==',
  closeImg:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1IDVMNSAxNU01IDVMMTUgMTUiIHN0cm9rZT0iIzFGMUYyMSIgc3Ryb2tlLXdpZHRoPSIxLjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=',
  connectWallet: 'Connect a Wallet',
  backImg:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzFGMUYyMSIgZD0iTTEwLjYgMy4zIDIuMiA5LjZDMS40IDEwLjIgMSAxMS4xIDEgMTJjMCAuOS40IDEuOCAxLjIgMi40bDguNCA2LjNjLjMuMi42LjMgMSAuMy44IDAgMS41LS42IDEuNi0xLjVsLjMtMy41IDYuNS0uN2MuMyAwIC40IDAgLjUtLjEgMS4zLS4zIDIuMy0xLjQgMi40LTIuN3YtMWMtLjEtMS4zLTEuMS0yLjUtMi40LTIuNy0uMSAwLS4zIDAtLjUtLjFMMTMuNSA4bC0uNC0zLjVDMTMgMy43IDEyLjMgMyAxMS41IDNjLS4zIDAtLjcuMS0uOS4zWiIvPjwvc3ZnPg==',
  darkBackImg:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSIyNSIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iI2ZmZiIgZD0ibTExLjEgMy44LTguNCA2LjNjLS44LjYtMS4yIDEuNS0xLjIgMi40IDAgLjkuNCAxLjggMS4yIDIuNGw4LjQgNi4zYy4zLjIuNi4zIDEgLjMuOCAwIDEuNS0uNiAxLjYtMS41bC4zLTMuNSA2LjUtLjdjLjMgMCAuNCAwIC41LS4xIDEuMy0uMyAyLjMtMS40IDIuNC0yLjd2LTFjLS4xLTEuMy0xLjEtMi41LTIuNC0yLjctLjEgMC0uMyAwLS41LS4xTDE0IDguNSAxMy42IDVjLS4xLS44LS44LTEuNS0xLjYtMS41LS4zIDAtLjcuMS0uOS4zWiIvPjwvc3ZnPg==',
  closeDarkImg:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMSIgaGVpZ2h0PSIyMSIgZmlsbD0ibm9uZSI+PHBhdGggc3Ryb2tlPSIjZmZmIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMS42IiBkPSJtMTUuNSA1LjUtMTAgMTBtMC0xMCAxMCAxMCIvPjwvc3ZnPg==',
};

const getWalletName = (name: string) => {
  switch (name) {
    case 'PortkeyDiscover':
      return 'Portkey';
    case 'NightElf':
      return 'Night Elf';
    default:
      return name;
  }
};

const darkTipIcon =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE2IDIyLjY2N2MuMzc4IDAgLjY5NC0uMTI4Ljk1LS4zODNhMS4yOSAxLjI5IDAgMCAwIC4zODMtLjk1IDEuMjkgMS4yOSAwIDAgMC0uMzgzLS45NUExLjI5IDEuMjkgMCAwIDAgMTYgMjBhMS4yOSAxLjI5IDAgMCAwLS45NS4zODQgMS4yOSAxLjI5IDAgMCAwLS4zODQuOTVjMCAuMzc3LjEyOC42OTQuMzg0Ljk1LjI1NS4yNTUuNTcyLjM4My45NS4zODNabTAtNS4zMzNjLjM3OCAwIC42OTQtLjEyOC45NS0uMzg0YTEuMjkgMS4yOSAwIDAgMCAuMzgzLS45NXYtNS4zMzNhMS4yOSAxLjI5IDAgMCAwLS4zODMtLjk1IDEuMjkgMS4yOSAwIDAgMC0uOTUtLjM4MyAxLjI5IDEuMjkgMCAwIDAtLjk1LjM4MyAxLjI5IDEuMjkgMCAwIDAtLjM4NC45NVYxNmMwIC4zNzguMTI4LjY5NS4zODQuOTUuMjU1LjI1Ni41NzIuMzg0Ljk1LjM4NFptMCAxMmMtMS44NDUgMC0zLjU3OC0uMzUtNS4yLTEuMDVhMTMuNDY1IDEzLjQ2NSAwIDAgMS00LjIzNC0yLjg1Yy0xLjItMS4yLTIuMTUtMi42MTEtMi44NS00LjIzNC0uNy0xLjYyMi0xLjA1LTMuMzU1LTEuMDUtNS4yIDAtMS44NDQuMzUtMy41NzggMS4wNS01LjIuNy0xLjYyMiAxLjY1LTMuMDMzIDIuODUtNC4yMzMgMS4yLTEuMiAyLjYxMi0yLjE1IDQuMjM0LTIuODUgMS42MjItLjcgMy4zNTUtMS4wNSA1LjItMS4wNSAxLjg0NCAwIDMuNTc4LjM1IDUuMiAxLjA1IDEuNjIyLjcgMy4wMzMgMS42NSA0LjIzMyAyLjg1IDEuMiAxLjIgMi4xNSAyLjYxMSAyLjg1IDQuMjMzLjcgMS42MjIgMS4wNSAzLjM1NiAxLjA1IDUuMiAwIDEuODQ1LS4zNSAzLjU3OC0xLjA1IDUuMmExMy40NjUgMTMuNDY1IDAgMCAxLTIuODUgNC4yMzRjLTEuMiAxLjItMi42MSAyLjE1LTQuMjMzIDIuODUtMS42MjIuNy0zLjM1NiAxLjA1LTUuMiAxLjA1WiIvPjwvc3ZnPg==';
const lightTipIcon =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzFGMUYyMSIgZD0iTTE2IDIyLjY2N2MuMzc4IDAgLjY5NS0uMTI4Ljk1LS4zODRhMS4yOSAxLjI5IDAgMCAwIC4zODMtLjk1IDEuMjkgMS4yOSAwIDAgMC0uMzgzLS45NUExLjI5IDEuMjkgMCAwIDAgMTYgMjBhMS4yOSAxLjI5IDAgMCAwLS45NS4zODMgMS4yOSAxLjI5IDAgMCAwLS4zODMuOTVjMCAuMzc4LjEyNy42OTUuMzgzLjk1LjI1Ni4yNTYuNTcyLjM4NC45NS4zODRabTAtNS4zMzRjLjM3OCAwIC42OTUtLjEyNy45NS0uMzgzYTEuMjkgMS4yOSAwIDAgMCAuMzgzLS45NXYtNS4zMzNhMS4yOSAxLjI5IDAgMCAwLS4zODMtLjk1IDEuMjkgMS4yOSAwIDAgMC0uOTUtLjM4NCAxLjI5IDEuMjkgMCAwIDAtLjk1LjM4NCAxLjI5IDEuMjkgMCAwIDAtLjM4My45NVYxNmMwIC4zNzguMTI3LjY5NS4zODMuOTUuMjU2LjI1Ni41NzIuMzgzLjk1LjM4M1ptMCAxMmMtMS44NDQgMC0zLjU3OC0uMzUtNS4yLTEuMDVhMTMuNDY1IDEzLjQ2NSAwIDAgMS00LjIzMy0yLjg1Yy0xLjItMS4yLTIuMTUtMi42MS0yLjg1LTQuMjMzLS43LTEuNjIyLTEuMDUtMy4zNTYtMS4wNS01LjIgMC0xLjg0NC4zNS0zLjU3OCAxLjA1LTUuMi43LTEuNjIyIDEuNjUtMy4wMzMgMi44NS00LjIzMyAxLjItMS4yIDIuNjEtMi4xNSA0LjIzMy0yLjg1IDEuNjIyLS43IDMuMzU2LTEuMDUgNS4yLTEuMDUgMS44NDUgMCAzLjU3OC4zNSA1LjIgMS4wNSAxLjYyMi43IDMuMDMzIDEuNjUgNC4yMzMgMi44NSAxLjIgMS4yIDIuMTUgMi42MSAyLjg1IDQuMjMzLjcgMS42MjIgMS4wNSAzLjM1NiAxLjA1IDUuMiAwIDEuODQ0LS4zNSAzLjU3OC0xLjA1IDUuMmExMy40NjUgMTMuNDY1IDAgMCAxLTIuODUgNC4yMzNjLTEuMiAxLjItMi42MSAyLjE1LTQuMjMzIDIuODUtMS42MjIuNy0zLjM1NSAxLjA1LTUuMiAxLjA1WiIvPjwvc3ZnPg==';

const defaultProps: Partial<IConfirmLogoutDialogProps> = {
  title: 'Confirm sign out',
  subTitle: [
    'Your assets will remain safe in your account and accessible next time you log in via social recovery.',
  ],
  okTxt: 'Sign out',
  cancelTxt: 'Cancel',
  visible: false,
  onOk: () => void 0,
  onCancel: () => void 0,
  width: 400,
  mobileWidth: 343,
};

interface ISignInModalProps {
  bridgeInstance: Bridge;
  wallets: WalletAdapter[];
  baseConfig: IBaseConfig;
}
const { isMobileDevices } = utils;

const ConfirmLogoutDialog = (props: Partial<IConfirmLogoutDialogProps>) => {
  const { title, subTitle, okTxt, cancelTxt, visible, onOk, onCancel, width, tipIcon, sdkTheme } = {
    ...defaultProps,
    ...props,
  };
  return (
    <CommonModal
      className="sign-out-confirm-modal"
      footer={null}
      open={visible}
      zIndex={10011}
      width={width}
      closable={false}
      onClose={onCancel}
    >
      <>
        <div>
          <div className="aelf-web-logout-dialog-header portkey-ui-flex portkey-ui-flex-between-center">
            {tipIcon && <img src={tipIcon} />}
            {!tipIcon && <img src={sdkTheme === 'dark' ? darkTipIcon : lightTipIcon} />}

            <CustomSvg
              type="Close"
              className={sdkTheme === 'dark' ? 'dark-close' : 'light-close'}
              style={{ width: 20, height: 20 }}
              onClick={onCancel}
            />
          </div>
          <div className="aelf-web-logout-dialog-title-wrap">
            <div className="aelf-web-logout-dialog-title aelf-web-logout-dialog-title-text">
              {title}
            </div>
          </div>

          <div>
            {subTitle?.map((t) => (
              <div key={t} className="aelf-web-logout-dialog-sub-title">
                {t}
              </div>
            ))}
          </div>
        </div>
        <div className="aelf-web-logout-dialog-btn-wrap">
          <Button type="primary" ghost onClick={onCancel}>
            {cancelTxt}
          </Button>
          <Button type="primary" danger onClick={onOk}>
            {okTxt}
          </Button>
        </div>
      </>
    </CommonModal>
  );
};

interface IDynamicWrapperProps {
  onCloseHandler: () => void;
  noCommonBaseModal: boolean;
}
const DynamicWrapper = ({
  children,
  onCloseHandler,
  noCommonBaseModal,
}: React.PropsWithChildren<IDynamicWrapperProps>) => {
  return noCommonBaseModal ? (
    <div>{children}</div>
  ) : (
    <CommonBaseModal
      destroyOnClose
      // className={clsx('portkey-ui-sign-modal', `portkey-ui-sign-modal-${portkeyOpts.design}`)}
      // maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      open={true}
      onClose={onCloseHandler}
    >
      {children}
    </CommonBaseModal>
  );
};

interface INestedModalProps {
  open: boolean;
  theme?: Theme;
  onClose: () => void;
  bridgeInstance: Bridge;
  design?: string;
  validWallets: WalletAdapter[];
}
const NestedModal = ({
  open,
  theme,
  onClose,
  validWallets,
  design,
  bridgeInstance,
}: INestedModalProps) => {
  const isMobileDevice = isMobileDevices();
  const isWeb2Design = design === 'Web2Design';

  const validWalletList = validWallets.map((wallet) => {
    return (
      <div
        key={wallet.name}
        className="nested-wallet-wrapper portkey-ui-flex-center"
        onClick={() => bridgeInstance.onUniqueWalletClick(wallet.name)}
      >
        <img src={theme === 'dark' ? wallet.darkIcon : wallet.icon} />
        <div className="nested-wallet-connect-text">{`Connect ${getWalletName(wallet.name)} wallet`}</div>
      </div>
    );
  });

  return isMobileDevice ? (
    <Drawer
      className="aelf-web-conntect-drawer"
      title={<></>}
      getContainer={false}
      closeIcon={null}
      onClose={onClose}
      height={272}
      prefixCls="portkey-ant-drawer"
      open={open}
      placement={'bottom'}
    >
      <div className="portkey-ui-flex-between-center nested-header">
        <img
          className="nested-close-back portkey-ui-cursor-pointer"
          src={theme === 'dark' ? constant.darkBackImg : constant.backImg}
          onClick={onClose}
        ></img>
        <img
          className="nested-left-close portkey-ui-cursor-pointer"
          src={theme === 'dark' ? constant.closeDarkImg : constant.closeImg}
          onClick={onClose}
        ></img>
      </div>
      <div
        className={`aelf-web-logout-dialog-title ${isWeb2Design ? 'nested-title-12' : 'nested-title'}`}
      >
        {constant.connectWallet}
      </div>
      <div className="nested-entry-wrapper nested-entry-wrapper-mobile">{validWalletList}</div>
    </Drawer>
  ) : (
    <Modal
      title={<></>}
      getContainer={false}
      open={open}
      closable={false}
      footer={null}
      centered={true}
      className="nested-connect-modal"
      prefixCls="portkey-ant-modal"
      width={430}
    >
      <div className="portkey-ui-flex-between-center nested-header">
        <img
          className="nested-close-back portkey-ui-cursor-pointer"
          src={theme === 'dark' ? constant.darkBackImg : constant.backImg}
          onClick={onClose}
        ></img>
        <img
          className="nested-left-close portkey-ui-cursor-pointer"
          src={theme === 'dark' ? constant.closeDarkImg : constant.closeImg}
          onClick={onClose}
        ></img>
      </div>

      <div
        className={`aelf-web-logout-dialog-title ${isWeb2Design ? 'nested-title-12' : 'nested-title'}`}
      >
        {constant.connectWallet}
      </div>

      <div className="nested-entry-wrapper">{validWalletList}</div>
    </Modal>
  );
};

const SignInModal: React.FC<ISignInModalProps> = (props: ISignInModalProps) => {
  const { bridgeInstance, wallets, baseConfig } = props;
  const [isShowWrapper, setIsShowWrapper] = useState(false);
  // const [loading, setLoading] = useState(false);
  const [isShowLockPanel, setIsShowLockPanel] = useState(false);
  const [password, setPassword] = useState('');
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const [isShowConfirmLogoutPanel, setIsShowConfirmLogoutPanel] = useState(false);
  const [isShowNestedModal, setIsShowNestedModal] = useState(false);
  const { handleTelegram, currentLifeCircle, caHash, originChainId, onTGSignInApprovalSuccess } =
    useTelegram(
      baseConfig.enableAcceleration,
      baseConfig.defaultPin,
      baseConfig.chainId,
      baseConfig.networkType,
      bridgeInstance,
      setIsShowWrapper,
      EE,
    );

  const guardianList = JSON.parse(enhancedLocalStorage.getItem(GUARDIAN_LIST_FOR_LOGIN) || '[]');

  const filteredWallets = wallets.filter((ele) => ele.name !== PORTKEYAA);
  const isMobileDevice = isMobileDevices();
  const {
    noCommonBaseModal = false,
    SignInComponent,
    ConfirmLogoutDialog: CustomizedConfirmLogoutDialog,
    cancelAutoLoginInTelegram = false,
    defaultPin = '111111',
    keyboard,
    enableAcceleration,
    PortkeyProviderProps,
  } = baseConfig;
  const FinalSignInComponent = SignInComponent || SignIn;
  const FinalConfirmLogoutDialog = CustomizedConfirmLogoutDialog || ConfirmLogoutDialog;
  // const isLocking = store.getState().isLocking;
  // console.log('isLocking', isLocking);

  const isToggleAccountRef = useRef(false);

  useEffect(() => {
    console.log(
      '----------------------the current environment is telegram:',
      TelegramPlatform.isTelegramPlatform(),
    );
    if (!TelegramPlatform.isTelegramPlatform()) {
      return;
    }

    const initializeTelegram = () => {
      const handleLogout = async () => {
        console.log('begin to execute handleLogout......');
        isToggleAccountRef.current = true;
        await bridgeInstance.onPortkeyAAUnLock(defaultPin);
        await bridgeInstance.doubleCheckDisconnect();
        TelegramPlatform.close();
      };
      TelegramPlatform.initializeTelegramWebApp({ tgUserChanged: handleLogout });
    };

    console.log('begin to init and execute handleTelegram', TelegramPlatform.isTelegramPlatform());
    initializeTelegram();
    async function autoAuthInTelegram() {
      console.log('isToggleAccountRef.current:', isToggleAccountRef.current);
      if (isToggleAccountRef.current) {
        return;
      }
      console.log('begin to excute autoAuthInTelegram');
      if (enhancedLocalStorage.getItem('connectedWallet') === PORTKEYAA) {
        if (enableAcceleration) {
          ConfigProvider.setGlobalConfig({
            globalLoadingHandler: {
              onSetLoading: (loadingInfo: any) => {
                console.log(loadingInfo, 'loadingInfo===');
              },
            },
          });
        }
        await bridgeInstance.onPortkeyAAUnLock(defaultPin);
        return;
      }
      if (!cancelAutoLoginInTelegram) {
        if (enableAcceleration) {
          ConfigProvider.setGlobalConfig({
            globalLoadingHandler: {
              onSetLoading: (loadingInfo: any) => {
                console.log(loadingInfo, 'loadingInfo===');
              },
            },
          });
        }
        console.log('begin to excute handleTelegram');
        handleTelegram();
      }
    }
    autoAuthInTelegram();
  }, [bridgeInstance, cancelAutoLoginInTelegram, defaultPin, enableAcceleration, handleTelegram]);

  bridgeInstance.autoLogin = () => {
    handleTelegram();
  };

  bridgeInstance.openLoginPanel = () => {
    setIsShowWrapper(true);
  };

  bridgeInstance.closeLoginPanel = () => {
    setIsShowWrapper(false);
  };

  bridgeInstance.openLoadingModal = () => {
    console.log('--------------------------openLoadingModal');
    setLoading(true);
  };

  bridgeInstance.closeLoadingModal = () => {
    console.log('--------------------------closeLoadingModal');
    setLoading(false);
  };

  bridgeInstance.openLockPanel = () => {
    setIsShowLockPanel(true);
  };

  bridgeInstance.closeLockPanel = () => {
    setIsShowLockPanel(false);
  };

  bridgeInstance.openConfirmLogoutPanel = () => {
    setIsShowConfirmLogoutPanel(true);
  };

  bridgeInstance.closeConfirmLogoutPanel = () => {
    setIsShowConfirmLogoutPanel(false);
  };

  bridgeInstance.closeNestedModal = () => {
    setIsShowNestedModal(false);
  };

  const onFinishInternal = useCallback(
    (didWallet: DIDWalletInfo) => {
      console.log('didWallet.createType', didWallet.createType);
      if (enableAcceleration && didWallet.createType === 'recovery') {
        console.log('onPortkeyAAWalletLoginWithAccelerationFinished--------1');
        bridgeInstance.onPortkeyAAWalletLoginWithAccelerationFinished(didWallet);
      } else {
        console.log('onPortkeyAAWalletLoginFinished----------');
        bridgeInstance.onPortkeyAAWalletLoginFinished(didWallet);
      }
    },
    [bridgeInstance, enableAcceleration],
  );

  const onCreatePendingInternal = useCallback(
    (createPendingInfo: CreatePendingInfo) => {
      if (!enableAcceleration) {
        return;
      }
      if (createPendingInfo.createType === 'register') {
        return;
      }
      bridgeInstance.onPortkeyAAWalletCreatePending(createPendingInfo);
    },
    [bridgeInstance, enableAcceleration],
  );

  const onCloseWrapperInternal = useCallback(() => {
    setIsShowNestedModal(false);
    setIsShowWrapper(false);
  }, []);

  const confirmLogoutHandler = useCallback(() => {
    bridgeInstance.doubleCheckDisconnect();
  }, [bridgeInstance]);

  const cancelLogoutHandler = useCallback(() => {
    bridgeInstance.closeConfirmLogoutPanel();
  }, [bridgeInstance]);

  const onUnlockInternal = useCallback(
    async (pin: string) => {
      const success = await bridgeInstance.onPortkeyAAUnLock(pin);
      if (!success) {
        setIsWrongPassword(true);
        if (isMobileDevice && keyboard) {
          setPassword('');
        }
      } else {
        setIsWrongPassword(false);
        setPassword('');
      }
    },
    [keyboard, bridgeInstance, isMobileDevice],
  );

  const extraWallets = useMemo(() => {
    if (baseConfig.design === 'SocialDesign') {
      return (
        <div className="aelf-web-extra-wallets-wrapper-social">
          <div className="social-design-wallets">
            <div className="title-icon">
              <img
                src={
                  baseConfig?.iconSrcForSocialDesign ||
                  defaultPropsForSocialDesign.iconSrcForSocialDesign
                }
              ></img>
            </div>
            <div className="aelf-web-logout-dialog-title portkey-ui-text-center">
              {baseConfig?.titleForSocialDesign || defaultPropsForSocialDesign.titleForSocialDesign}
            </div>
          </div>
          <div className="social-design-wallets">
            {filteredWallets.map((item) => (
              <div
                className="social-design-wallet-wrapper"
                onClick={() => bridgeInstance.onUniqueWalletClick(item.name)}
                key={item.name}
              >
                <img src={PortkeyProviderProps?.theme === 'dark' ? item.darkIcon : item.icon} />
                <div className="nested-wallet-connect-text">{`Connect ${getWalletName(item.name)} wallet`}</div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <>
          <div className="aelf-web-extra-wallets-wrapper-crypto">
            {/* <div className="crypto-wallets-title">Crypto wallet</div> */}
            <div
              className={`crypto-extra-wallets ${baseConfig.design === 'Web2Design' && 'web2-extra-wallets'}`}
              onClick={() => {
                setIsShowNestedModal(true);
              }}
            >
              <div className="crypto-extra-wallets-left">{constant.connectWallet}</div>
              <div className="crypto-extra-image">
                {filteredWallets.map((item) => (
                  <img
                    key={item.name}
                    src={PortkeyProviderProps?.theme === 'dark' ? item.darkIcon : item.icon}
                  />
                ))}
                {/* <img className="crypto-extra-image-arrow" src={constant.rightImg} /> */}
              </div>
            </div>
          </div>
          <NestedModal
            open={isShowNestedModal}
            theme={PortkeyProviderProps?.theme}
            onClose={() => {
              setIsShowNestedModal(false);
            }}
            design={baseConfig.design}
            bridgeInstance={bridgeInstance}
            validWallets={filteredWallets}
          />
        </>
      );
    }
  }, [
    PortkeyProviderProps?.theme,
    baseConfig.design,
    baseConfig?.iconSrcForSocialDesign,
    baseConfig?.titleForSocialDesign,
    bridgeInstance,
    filteredWallets,
    isShowNestedModal,
  ]);

  const onForgetPinHandler = useCallback(async () => {
    // await bridgeInstance.onPortkeyAAUnLock(defaultPin);
    await bridgeInstance.disConnect(true);
    if (TelegramPlatform.isTelegramPlatform()) {
      TelegramPlatform.close();
    }
  }, [bridgeInstance]);

  const forgetPinElement = useMemo(() => {
    return (
      <div className="unlock-footer-text">
        Forget PIN?
        <span className="unlock-footer-text-href" onClick={onForgetPinHandler}>
          Log back in
        </span>
      </div>
    );
  }, [onForgetPinHandler]);

  const [showGuardianApprovalModal, setShowGuardianApprovalModal] = useState(false);

  useEffect(() => {
    EE.on(SET_GUARDIAN_APPROVAL_MODAL, setShowGuardianApprovalModal);
    return () => {
      EE.off(SET_GUARDIAN_APPROVAL_MODAL, setShowGuardianApprovalModal);
    };
  }, []);

  return (
    // <PortkeyProvider networkType={baseConfig.networkType} theme="dark">
    <div>
      {!isShowWrapper ? null : isShowLockPanel ? (
        <Unlock
          className="web-login-unlock-wrapper"
          open={true}
          value={password}
          isWrongPassword={isWrongPassword}
          keyboard={keyboard}
          onChange={setPassword}
          onCancel={onCloseWrapperInternal}
          onUnlock={onUnlockInternal}
          footer={forgetPinElement}
        />
      ) : (
        <DynamicWrapper
          onCloseHandler={onCloseWrapperInternal}
          noCommonBaseModal={noCommonBaseModal}
        >
          <FinalSignInComponent
            pin={TelegramPlatform.isTelegramPlatform() ? defaultPin : undefined}
            defaultLifeCycle={currentLifeCircle}
            defaultChainId={baseConfig.chainId}
            uiType="Full"
            design={baseConfig.design}
            isShowScan
            extraElementList={[extraWallets]}
            keyboard={keyboard}
            onCancel={() => {
              //TODO: seem to not execute
              console.log('onSignInCancel');
            }}
            onError={(error) => {
              console.error('onSignInInternalError', error);
            }}
            onCreatePending={onCreatePendingInternal}
            onFinish={onFinishInternal}
          />
        </DynamicWrapper>
      )}

      {guardianList?.length > 0 && (
        <GuardianApprovalModal
          open={showGuardianApprovalModal}
          networkType={baseConfig.networkType}
          caHash={caHash}
          originChainId={originChainId}
          targetChainId={baseConfig.chainId}
          guardianList={guardianList}
          operationType={OperationTypeEnum.communityRecovery}
          operationDetails={getOperationDetails(OperationTypeEnum.communityRecovery)}
          onClose={() => EE.emit(SET_GUARDIAN_APPROVAL_MODAL, false)}
          onBack={() => EE.emit(SET_GUARDIAN_APPROVAL_MODAL, false)}
          onApprovalSuccess={onTGSignInApprovalSuccess}
        />
      )}

      <FinalConfirmLogoutDialog
        sdkTheme={PortkeyProviderProps?.theme}
        visible={isShowConfirmLogoutPanel}
        onOk={confirmLogoutHandler}
        onCancel={cancelLogoutHandler}
      />
      <PortkeyLoading />
    </div>
    // </PortkeyProvider>
  );
};

export default SignInModal;

// const demoFn = (bool: boolean) => {
//   console.log('demoFn', EE);
//   EE.emit('SET_GLOBAL_LOADING_1', bool);
// };

// export { demoFn };
