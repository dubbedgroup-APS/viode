export const getOwnerEmail = () =>
  (process.env.OWNER_EMAIL || "").trim().toLowerCase();

export const canUserUpload = (user) => {
  const ownerEmail = getOwnerEmail();

  if (!ownerEmail || !user?.email) {
    return false;
  }

  return user.email.toLowerCase() === ownerEmail;
};
