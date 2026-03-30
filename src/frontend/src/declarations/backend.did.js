/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

const ActivationKeyResult = IDL.Record({
  'valid': IDL.Bool,
  'chainType': IDL.Text,
  'alreadyUsed': IDL.Bool,
});

const WithdrawalCodeResult = IDL.Record({
  'valid': IDL.Bool,
  'alreadyUsed': IDL.Bool,
});

const ActivationKeyInfo = IDL.Record({
  'key': IDL.Text,
  'chainType': IDL.Text,
  'used': IDL.Bool,
});

const WithdrawalCodeInfo = IDL.Record({
  'code': IDL.Text,
  'used': IDL.Bool,
});

const MockWallet = IDL.Record({
  'address': IDL.Text,
  'chain': IDL.Text,
  'balance': IDL.Text,
});

const AdminStats = IDL.Record({
  'totalKeys': IDL.Nat,
  'usedKeys': IDL.Nat,
  'totalCodes': IDL.Nat,
  'usedCodes': IDL.Nat,
  'totalWallets': IDL.Nat,
});

export const idlService = IDL.Service({
  'greet': IDL.Func([IDL.Text], [IDL.Text], ['query']),
  'addActivationKey': IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
  'validateActivationKey': IDL.Func([IDL.Text], [ActivationKeyResult], []),
  'getActivationKeys': IDL.Func([IDL.Text], [IDL.Vec(ActivationKeyInfo)], ['query']),
  'addWithdrawalCode': IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
  'validateWithdrawalCode': IDL.Func([IDL.Text], [WithdrawalCodeResult], []),
  'getWithdrawalCodes': IDL.Func([IDL.Text], [IDL.Vec(WithdrawalCodeInfo)], ['query']),
  'addMockWallet': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
  'getMockWallets': IDL.Func([], [IDL.Vec(MockWallet)], ['query']),
  'clearMockWallets': IDL.Func([IDL.Text], [IDL.Bool], []),
  'getAdminStats': IDL.Func([IDL.Text], [AdminStats], ['query']),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const ActivationKeyResult = IDL.Record({
    'valid': IDL.Bool,
    'chainType': IDL.Text,
    'alreadyUsed': IDL.Bool,
  });
  const WithdrawalCodeResult = IDL.Record({
    'valid': IDL.Bool,
    'alreadyUsed': IDL.Bool,
  });
  const ActivationKeyInfo = IDL.Record({
    'key': IDL.Text,
    'chainType': IDL.Text,
    'used': IDL.Bool,
  });
  const WithdrawalCodeInfo = IDL.Record({
    'code': IDL.Text,
    'used': IDL.Bool,
  });
  const MockWallet = IDL.Record({
    'address': IDL.Text,
    'chain': IDL.Text,
    'balance': IDL.Text,
  });
  const AdminStats = IDL.Record({
    'totalKeys': IDL.Nat,
    'usedKeys': IDL.Nat,
    'totalCodes': IDL.Nat,
    'usedCodes': IDL.Nat,
    'totalWallets': IDL.Nat,
  });
  return IDL.Service({
    'greet': IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'addActivationKey': IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
    'validateActivationKey': IDL.Func([IDL.Text], [ActivationKeyResult], []),
    'getActivationKeys': IDL.Func([IDL.Text], [IDL.Vec(ActivationKeyInfo)], ['query']),
    'addWithdrawalCode': IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'validateWithdrawalCode': IDL.Func([IDL.Text], [WithdrawalCodeResult], []),
    'getWithdrawalCodes': IDL.Func([IDL.Text], [IDL.Vec(WithdrawalCodeInfo)], ['query']),
    'addMockWallet': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
    'getMockWallets': IDL.Func([], [IDL.Vec(MockWallet)], ['query']),
    'clearMockWallets': IDL.Func([IDL.Text], [IDL.Bool], []),
    'getAdminStats': IDL.Func([IDL.Text], [AdminStats], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };
