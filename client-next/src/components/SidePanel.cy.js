import { mount } from "cypress-react-unit-test";
import React from "react";
import SidePanel from "./SidePanel";

describe("SidePanel", () => {

  it("SidePanel", () => {
    const trees = [{
      first_name: "Dadior",
      last_name: "Chen",
      image_url: "https://treetracker-production.nyc3.digitaloceanspaces.com/2018.11.20.12.11.07_e7a81cf4-2d37-45ee-9d5a-47bdfd7c43cc_IMG_20181120_121037_7990135604649410080.jpg",
      user_image_url: "https://treetracker-production.nyc3.digitaloceanspaces.com/2019.07.10.18.32.42_b4fad89a-10b6-40cc-a134-0085d0e581d2_IMG_20190710_183201_8089920786231467340.jpg",
      id: 1,
    },{
      first_name: "Ezra",
      last_name: "David",
      image_url: "https://treetracker-dev.nyc3.digitaloceanspaces.com/2018.09.07.11.04.27_3ae160d9-58f7-4373-a4c2-3b39edbacd2e_IMG_20180907_095704_764193446.jpg",
      user_image_url: "https://treetracker-production.nyc3.digitaloceanspaces.com/Miti%20Aliance%20Image2.png",
      id: 2,
    }];

    function Test(){
      const [treeIndex, setTreeIndex] = React.useState(0);

      function handleNext(){
        setTreeIndex(treeIndex + 1);
      }

      return(
        <div style={{background:"gray",height:"1000px"}} >
          <SidePanel 
            state={"show"}
            tree={trees[treeIndex]} 
            onNext={handleNext}
            hasNext={treeIndex < trees.length - 1}
            hasPrevious={treeIndex > 0}
          />
        </div>
      )
    }
    mount(
      <Test/>
    );
    cy.contains("Dadior");
    //is loading
    //cy.get(".treePictureLoading");
    cy.get(".treePictureLoaded", {timeout: 1000* 30});
    cy.get("button[title='previous tree']").should("not.exist");
    cy.get("button[title='next tree']")
      .click();
    cy.contains("Ezra");
    cy.get("button[title='previous tree']");
    cy.get("button[title='next tree']").should("not.exist");
    cy.get(".treePictureLoaded", {timeout:1000*30});
//    //should placed logo as avatar, cuz no image
//    cy.get("#planter-img")
//      .find("img")
//      .should("has.attr", "src")
//      .and("match", /greenstand_logo/);
  });

  it("SidePanelEmpty", () => {

    function Test(){
      const [state, setState] = React.useState("none");
      const [tree, setTree] = React.useState(undefined);
      function handleClick(){
        setTree({
          first_name: "Dadior",
          last_name: "Chen",
        });
        setState("show");
      }
      function handleClose(){
        setState("hide");
      }

      function handleShow(){
        setState("show");
      }

      function handleDisable(){
        setState("none");
      }
      return(
        <div>
          <button onClick={handleClick}>show</button>
          <button onClick={handleDisable}>disable</button>
          <SidePanel state={state} tree={tree} onClose={handleClose} onShow={handleShow} />
        </div>
      )
    }
    mount(
      <Test/>
    );
    cy.contains("show").click();
    cy.contains("Dadior");
    cy.get(".treePictureLoading").should("not.exist");
    cy.get("img[alt='tree planted']").should("not.exist");

    //close it
    cy.get("div[title='hide']")
      .click();
    cy.contains("Dadior")
      .should("not.visible");
    cy.get("div[title='show']")
      .click();
    cy.contains("Dadior")
      .should("visible");
    cy.contains("disable")
      .click();
    cy.get("div[title='show']")
      .should("not.exist");
  });

});
