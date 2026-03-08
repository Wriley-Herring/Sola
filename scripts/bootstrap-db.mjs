function main() {
  console.error(
    "[db:bootstrap] Bootstrap is temporarily disabled: Prisma-based SQL execution was removed. " +
      "Implement a non-Prisma SQL execution path before re-enabling this script."
  );
  process.exit(1);
}

main();
