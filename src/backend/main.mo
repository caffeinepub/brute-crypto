
import Text "mo:base/Text";
import Buffer "mo:base/Buffer";

persistent actor {
  transient let ADMIN_TOKEN : Text = "BruteCryptoAdmin2026";

  type ActivationKey = {
    key : Text;
    chainType : Text;
    var used : Bool;
  };

  type WithdrawalCode = {
    code : Text;
    var used : Bool;
  };

  type MockWallet = {
    address : Text;
    chain : Text;
    balance : Text;
  };

  // Stable storage (plain tuples, no var fields)
  var stableActivationKeys : [(Text, Text, Bool)] = [
    ("GIAYACEY", "btc", false),
    ("OVECSIBS", "btc", false),
    ("YEVSGUVA", "btc", false),
    ("FSHVSJNW", "eth", false),
    ("GSYSSGUI", "eth", false),
    ("HSGSVSUU", "eth", false),
    ("TVVUVETY", "bnb", false),
    ("HSGVSFUI", "bnb", false),
    ("TWIGSXOW", "bnb", false),
    ("GEHBSCIY", "usdt", false),
    ("HEGVSIJU", "usdt", false),
    ("HEUBEIHH", "usdt", false),
    ("GEUJWIJV", "all", false),
    ("KAIHVWFY", "all", false),
    ("GSYVUWIN", "all", false),
    ("UIOENSOP", "all", false),
    ("BRUTECRYPTOADM", "master", false)
  ];

  var stableWithdrawalCodes : [(Text, Bool)] = [
    ("GUEHEUGR", false),
    ("WHWUUHW", false),
    ("OPAO728DU", false)
  ];

  var stableMockWallets : [(Text, Text, Text)] = [];

  // Runtime buffers (non-stable, loaded from stable arrays)
  transient var activationKeys : Buffer.Buffer<ActivationKey> = Buffer.Buffer(20);
  transient var withdrawalCodes : Buffer.Buffer<WithdrawalCode> = Buffer.Buffer(10);
  transient var mockWallets : Buffer.Buffer<MockWallet> = Buffer.Buffer(20);

  // Initialize buffers from stable arrays
  do {
    for ((k, ct, u) in stableActivationKeys.vals()) {
      activationKeys.add({ key = k; chainType = ct; var used = u });
    };
    for ((c, u) in stableWithdrawalCodes.vals()) {
      withdrawalCodes.add({ code = c; var used = u });
    };
    for ((a, ch, b) in stableMockWallets.vals()) {
      mockWallets.add({ address = a; chain = ch; balance = b });
    };
  };

  system func preupgrade() {
    // Serialize buffers back to stable tuples
    let akBuf = Buffer.Buffer<(Text, Text, Bool)>(activationKeys.size());
    for (k in activationKeys.vals()) {
      akBuf.add((k.key, k.chainType, k.used));
    };
    stableActivationKeys := Buffer.toArray(akBuf);

    let wcBuf = Buffer.Buffer<(Text, Bool)>(withdrawalCodes.size());
    for (c in withdrawalCodes.vals()) {
      wcBuf.add((c.code, c.used));
    };
    stableWithdrawalCodes := Buffer.toArray(wcBuf);

    let mwBuf = Buffer.Buffer<(Text, Text, Text)>(mockWallets.size());
    for (w in mockWallets.vals()) {
      mwBuf.add((w.address, w.chain, w.balance));
    };
    stableMockWallets := Buffer.toArray(mwBuf);
  };

  system func postupgrade() {
    activationKeys := Buffer.Buffer(stableActivationKeys.size() + 5);
    for ((k, ct, u) in stableActivationKeys.vals()) {
      activationKeys.add({ key = k; chainType = ct; var used = u });
    };
    withdrawalCodes := Buffer.Buffer(stableWithdrawalCodes.size() + 5);
    for ((c, u) in stableWithdrawalCodes.vals()) {
      withdrawalCodes.add({ code = c; var used = u });
    };
    mockWallets := Buffer.Buffer(stableMockWallets.size() + 5);
    for ((a, ch, b) in stableMockWallets.vals()) {
      mockWallets.add({ address = a; chain = ch; balance = b });
    };
  };

  // --- Activation Keys ---

  public func addActivationKey(adminToken : Text, key : Text, chainType : Text) : async Bool {
    if (adminToken != ADMIN_TOKEN) return false;
    activationKeys.add({ key = Text.toUppercase(key); chainType; var used = false });
    true
  };

  public func validateActivationKey(key : Text) : async { valid : Bool; chainType : Text; alreadyUsed : Bool } {
    let upper = Text.toUppercase(key);
    let size = activationKeys.size();
    var i = 0;
    while (i < size) {
      let k = activationKeys.get(i);
      if (k.key == upper) {
        if (k.used) {
          return { valid = true; chainType = k.chainType; alreadyUsed = true };
        } else {
          k.used := true;
          return { valid = true; chainType = k.chainType; alreadyUsed = false };
        };
      };
      i += 1;
    };
    { valid = false; chainType = ""; alreadyUsed = false }
  };

  public query func getActivationKeys(adminToken : Text) : async [{ key : Text; chainType : Text; used : Bool }] {
    if (adminToken != ADMIN_TOKEN) return [];
    let out = Buffer.Buffer<{ key : Text; chainType : Text; used : Bool }>(activationKeys.size());
    for (k in activationKeys.vals()) {
      out.add({ key = k.key; chainType = k.chainType; used = k.used });
    };
    Buffer.toArray(out)
  };

  // --- Withdrawal Codes ---

  public func addWithdrawalCode(adminToken : Text, code : Text) : async Bool {
    if (adminToken != ADMIN_TOKEN) return false;
    withdrawalCodes.add({ code = Text.toUppercase(code); var used = false });
    true
  };

  public func validateWithdrawalCode(code : Text) : async { valid : Bool; alreadyUsed : Bool } {
    let upper = Text.toUppercase(code);
    let size = withdrawalCodes.size();
    var i = 0;
    while (i < size) {
      let c = withdrawalCodes.get(i);
      if (c.code == upper) {
        if (c.used) {
          return { valid = true; alreadyUsed = true };
        } else {
          c.used := true;
          return { valid = true; alreadyUsed = false };
        };
      };
      i += 1;
    };
    { valid = false; alreadyUsed = false }
  };

  public query func getWithdrawalCodes(adminToken : Text) : async [{ code : Text; used : Bool }] {
    if (adminToken != ADMIN_TOKEN) return [];
    let out = Buffer.Buffer<{ code : Text; used : Bool }>(withdrawalCodes.size());
    for (c in withdrawalCodes.vals()) {
      out.add({ code = c.code; used = c.used });
    };
    Buffer.toArray(out)
  };

  // --- Mock Wallets ---

  public func addMockWallet(adminToken : Text, address : Text, chain : Text, balance : Text) : async Bool {
    if (adminToken != ADMIN_TOKEN) return false;
    mockWallets.add({ address; chain; balance });
    true
  };

  public query func getMockWallets() : async [{ address : Text; chain : Text; balance : Text }] {
    let out = Buffer.Buffer<{ address : Text; chain : Text; balance : Text }>(mockWallets.size());
    for (w in mockWallets.vals()) {
      out.add({ address = w.address; chain = w.chain; balance = w.balance });
    };
    Buffer.toArray(out)
  };

  public func clearMockWallets(adminToken : Text) : async Bool {
    if (adminToken != ADMIN_TOKEN) return false;
    mockWallets := Buffer.Buffer(20);
    true
  };

  // --- Admin Stats ---

  public query func getAdminStats(adminToken : Text) : async {
    totalKeys : Nat;
    usedKeys : Nat;
    totalCodes : Nat;
    usedCodes : Nat;
    totalWallets : Nat;
  } {
    if (adminToken != ADMIN_TOKEN) return {
      totalKeys = 0; usedKeys = 0;
      totalCodes = 0; usedCodes = 0;
      totalWallets = 0;
    };
    var usedK = 0;
    for (k in activationKeys.vals()) { if (k.used) usedK += 1; };
    var usedC = 0;
    for (c in withdrawalCodes.vals()) { if (c.used) usedC += 1; };
    {
      totalKeys = activationKeys.size();
      usedKeys = usedK;
      totalCodes = withdrawalCodes.size();
      usedCodes = usedC;
      totalWallets = mockWallets.size();
    }
  };
};
