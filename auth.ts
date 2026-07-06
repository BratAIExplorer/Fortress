// Minimal NextAuth stub - prevents build failures
// Full auth implementation can be added later

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const auth = async () => {
  return {
    user: {
      id: "anonymous",
      name: "Anonymous User",
      email: "anonymous@example.com",
    },
  };
};

export const handlers = {
  GET: async (req: any) => {
    return new Response("Auth endpoint", { status: 200 });
  },
  POST: async (req: any) => {
    return new Response("Auth endpoint", { status: 200 });
  },
};
