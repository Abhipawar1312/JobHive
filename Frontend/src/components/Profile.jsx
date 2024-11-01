import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Contact, Mail, Pen } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/Hooks/useGetAppliedJobs";

const skills = ["Html", "CSS", "Javascript", "Reactjs"];
const isResume = true;
const Profile = () => {
  useGetAppliedJobs();
  const [open, setOpen] = useState(false);

  const { user } = useSelector((store) => store.auth);

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl p-8 mx-auto my-5 bg-white border border-gray-200 rounded-2xl">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src="https://imgs.search.brave.com/TIwdT0C8kfwx1urlntz9I_Op__QJhWp08Su5TVHCnXw/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTI5/OTgyODE0OC92ZWN0/b3IvZWxlY3RyaWMt/Y29tcGFueS1kZXNp/Z24tYmFkZ2UuanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPWJh/RWhETEswWEtER2Yz/MWFDQndmVnZEZHVk/XzJobENvNl9GSDhj/ZjFvRkk9"
                alt="profile"
              />
            </Avatar>
            <div>
              <h1 className="text-xl font-medium">{user?.fullname}</h1>
              <p>{user?.profile?.bio}</p>
            </div>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="text-right"
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
          <h1>Skills</h1>
          <div className="flex items-center gap-1">
            {user?.profile?.skills.length !== 0 ? (
              user?.profile?.skills.map((item, index) => (
                <Badge key={index}>{item}</Badge>
              ))
            ) : (
              <span>NA</span>
            )}
          </div>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label className="font-bold text-md">Resume</Label>
          {isResume ? (
            <a
              target="blank"
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
      <div className="max-w-4xl mx-auto bg-white rounded-2xl">
        <h1 className="my-5 text-lg font-bold">Applied Jobs</h1>
        <AppliedJobTable />
      </div>
      <UpdateProfileDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default Profile;
