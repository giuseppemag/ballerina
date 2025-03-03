import { OrderedMap } from "immutable";
import { v4 } from "uuid";
import { Guid, SimpleCallback } from "../../../../../main";

export const AttachmentsList = (props: {
  attachments: OrderedMap<Guid, File>;
  add: SimpleCallback<[Guid, File]>;
  remove: SimpleCallback<Guid>;
}) => (
  <>
    <ul>
      {props.attachments
        .map((file, fileId) => (
          <>
            <button onClick={() => props.remove(fileId)}>{file.name} 🗑️</button>
          </>
        ))
        .valueSeq()}
    </ul>
    <input
      type="file"
      onChange={(e) => {
        if (e.currentTarget.files != null)
          props.add([v4(), e.currentTarget.files[0]]);
      }}
    />
  </>
);
