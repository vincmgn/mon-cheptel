export default defineEventHandler(async () => {
  return await prisma.bull.findMany({
    include: {
      comments: true,
    },
    orderBy: {
      name: "asc",
    },
  });
});
