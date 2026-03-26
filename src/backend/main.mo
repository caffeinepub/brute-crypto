actor {
  public query ({ caller }) func greet(name : Text) : async Text {
    "Hello, " # name # "! Welcome to Brute Crypto. Backend is running.";
  };
};
