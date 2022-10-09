import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import "@aws-amplify/ui-react/styles.css";
import { API, Storage } from "aws-amplify";
import {
  Button,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const url = await Storage.get(note.name);
          note.image = url;
        }
        return note;
      })
    );
    setNotes(notesFromAPI);
  }
  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const image = form.get("image");
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      image: image.name,
    };
    if (!!data.image) await Storage.put(data.name, image);
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id, name }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await Storage.remove(name);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  return (
    <View className="App">
      <Header />
      <h1>Create a Lost or Found Pet Report</h1>
      <View as="form" onSubmit={createNote} className="form">
        <Flex direction="column" justifyContent="center">
          <TextField
            name="name"
            placeholder="Pet Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Pet Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
          <View
            name="image"
            as="input"
            type="file"
            style={{ alignSelf: "center" }}
          />
          <div>
            <Button type="submit" variation="primary" className="create-report">
              Create Report
            </Button>
          </div>
        </Flex>
      </View>
      <Heading level={2} className="second-title">
        Current Lost and Found Pets
      </Heading>
      <a href="http://drive.google.com/open?id=119Tplx2LxfrWPCNL27pewn76psg51yY&usp=sharing_eip_se_dm" className="link-map">
        Paw Prints
      </a>
      {/* <a href="4088366222@txt.att.net">Pet SMS Alert</a> */}
      <a href="mailto:4088366222@txt.att.net?cc=9548737113@tmomail.net, maritaperez90@gmail.com, &bcc=lmattos2016@fau.edu&subject=Mail from PetWatch&body=Lost Pet">Pet SMS Alert</a>
      <View>
        {notes.map((note) => (
          <Flex
            key={note.id || note.name}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <div className="pet-image-wrapper">
              {note.image && (
                <Image
                  src={note.image}
                  alt={`visual aid for ${notes.name}`}
                  style={{ width: 100 }}
                  className="pet-image"
                />
              )}
            </div>
            <div className="pet-details">
              <Text as="strong" fontWeight={700}>
                {note.name}
              </Text>
              <Text as="span">{note.description}</Text>
            </div>
            {/* <Button variation="link" onClick={() => deleteNote(note)}>
              Delete note
            </Button> */}
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);
