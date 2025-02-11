import React, { useContext, useState } from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Contact, Mail, Pen } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/Hooks/useGetAppliedJobs";
import { LoadingBarContext } from "./LoadingBarContext";

const Profile = () => {
  useGetAppliedJobs();
  const loadingBarRef = useContext(LoadingBarContext);
  loadingBarRef.current.continuousStart();
  loadingBarRef.current.complete();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);

  return (
    <div className="px-4">
      <div className="max-w-4xl p-8 mx-auto my-5 border border-gray-200 rounded-2xl">
        <div className="flex flex-col justify-between md:flex-row">
          <div className="flex items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user?.profile?.profilePhoto} alt="profile" />
            </Avatar>
            <div>
              <h1 className="text-xl font-medium">{user?.fullname}</h1>
              <p>{user?.profile?.bio}</p>
            </div>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="mt-4 md:mt-0"
            variant="outline"
          >
            <Pen />
          </Button>
        </div>
        <div className="my-5">
          <div className="flex items-center gap-3 my-2">
            <Mail />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 my-2">
            <Contact />
            <span>{user?.phoneNumber}</span>
          </div>
        </div>
        <div className="my-5">
          <h1 className="font-bold">Skills</h1>
          <div className="flex flex-wrap items-center gap-1">
            {user?.profile?.skills?.length > 0 ? (
              user?.profile?.skills.map((item, index) => (
                <Badge key={index}>{item}</Badge>
              ))
            ) : (
              <span>NA</span>
            )}
          </div>
        </div>
        <div className="w-full max-w-sm mx-auto">
          <Label className="font-bold text-md">Resume</Label>
          {user?.profile?.resume ? (
            <a
              target="_blank"
              rel="noreferrer"
              href={user?.profile?.resume}
              className="w-full text-blue-500 cursor-pointer hover:underline"
            >
              {user?.profile?.resumeOriginalName}
            </a>
          ) : (
            <span>NA</span>
          )}
        </div>
      </div>
      <div className="max-w-4xl px-4 mx-auto rounded-2xl">
        <h1 className="my-5 text-lg font-bold">Applied Jobs</h1>
        <AppliedJobTable />
      </div>
      <UpdateProfileDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default Profile;
